import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent, ArchInterface, ArchDataStore } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import pascalRulePack from '../rules/pascal.json';
import dfmRulePack from '../rules/dfm.json';

export class DelphiAnalyzer implements Analyzer {
  public id = 'delphi';
  public name = 'Delphi / Object Pascal Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pPack = (pascalRulePack as any).default || pascalRulePack;
    const dPack = (dfmRulePack as any).default || dfmRulePack;
    this.engine.registerRulePack(pPack);
    this.engine.registerRulePack(dPack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.pas', '.dpr', '.dpk', '.dfm', '.fmx'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const delphiFiles = ctx.files.filter(f => ['.pas', '.dpr', '.dpk', '.dfm', '.fmx'].includes(f.extension.toLowerCase()));
    const pasFiles = delphiFiles.filter(f => f.extension.toLowerCase() === '.pas');
    const dfmFiles = delphiFiles.filter(f => ['.dfm', '.fmx'].includes(f.extension.toLowerCase()));

    const unitMap = new Map<string, { pasFile?: string; dfmFile?: string; className?: string; isForm?: boolean }>();

    // Index PAS files
    for (const file of pasFiles) {
      const unitName = path.basename(file.relativePath, '.pas').toLowerCase();
      unitMap.set(unitName, { pasFile: file.relativePath });
    }

    // Pair DFM files with PAS files
    for (const dfmFile of dfmFiles) {
      const ext = path.extname(dfmFile.relativePath);
      const unitName = path.basename(dfmFile.relativePath, ext).toLowerCase();
      const existing = unitMap.get(unitName) || {};
      existing.dfmFile = dfmFile.relativePath;
      unitMap.set(unitName, existing);
    }

    const delphiProject = ctx.archModel.projects.find(p => p.frameworks.some(f => f.includes('Delphi'))) || ctx.archModel.projects[0];
    const projectId = delphiProject ? delphiProject.id : 'project-delphi';

    // Process unit pairings and extract components
    for (const [unitName, entry] of unitMap.entries()) {
      let componentName = unitName.charAt(0).toUpperCase() + unitName.slice(1);
      let loc = 0;
      let layer: ArchComponent['layer'] = 'presentation';
      const evidence = [];
      const publicSymbols: string[] = [];

      // Check DFM contents
      if (entry.dfmFile) {
        const text = ctx.fileTextCache.get(ctx.files.find(f => f.relativePath === entry.dfmFile)!.absolutePath) || '';
        if (text.startsWith('TPF0')) {
          // Binary DFM
          evidence.push({ file: entry.dfmFile, snippet: 'Binary DFM (TPF0) - binary form format detected' });
        } else {
          const facts = this.engine.analyze(entry.dfmFile, text, '.dfm');
          for (const dec of facts.declarations) {
            publicSymbols.push(`${dec.name}: ${dec.type}`);
            if (dec.type && ['TForm', 'TFrame', 'TDataModule'].some(t => dec.type?.includes(t))) {
              entry.isForm = true;
              if (dec.type.includes('TDataModule')) {
                layer = 'data';
              }
            }
            if (dec.type && ['TFDConnection', 'TADOConnection', 'TSQLConnection', 'TClientDataSet', 'TFDQuery', 'TADOQuery', 'TFDTable'].some(t => dec.type?.includes(t))) {
              ctx.archModel.dataStores.push({
                id: `datastore-${unitName}-${dec.line}`,
                name: dec.name,
                kind: 'relational',
                technology: dec.type,
                usedBy: [`comp-delphi-${unitName}`],
                models: [],
                evidence: [{ file: entry.dfmFile, line: dec.line, snippet: dec.snippet }],
              });
            }
          }

          for (const dataFact of facts.dataAccess) {
            ctx.archModel.dataStores.push({
              id: `datastore-${unitName}-${dataFact.line}`,
              name: dataFact.name,
              kind: 'relational',
              technology: 'FireDAC / ADO DB Control',
              usedBy: [`comp-delphi-${unitName}`],
              models: [],
              evidence: [{ file: entry.dfmFile, line: dataFact.line, snippet: dataFact.snippet }],
            });
          }
        }
        evidence.push({ file: entry.dfmFile });
      }

      // Check PAS contents
      if (entry.pasFile) {
        const fileObj = ctx.files.find(f => f.relativePath === entry.pasFile);
        if (fileObj) {
          const text = ctx.fileTextCache.get(fileObj.absolutePath) || '';
          loc = text.split(/\r?\n/).length;

          const facts = this.engine.analyze(entry.pasFile, text, '.pas');
          for (const dec of facts.declarations) {
            publicSymbols.push(dec.name);
          }

          for (const extCall of facts.externalCalls) {
            ctx.archModel.relationships.push({
              id: `rel-delphi-dll-${unitName}-${extCall.line}`,
              fromId: `comp-delphi-${unitName}`,
              toId: `external-${extCall.name}`,
              kind: 'native-dll',
              label: `P/Invoke DLL external call: ${extCall.name}`,
              evidence: [{ file: entry.pasFile, line: extCall.line, snippet: extCall.snippet }],
              confidence: 'Extracted',
            });
          }

          evidence.push({ file: entry.pasFile });
        }
      }

      const comp: ArchComponent = {
        id: `comp-delphi-${unitName}`,
        name: componentName,
        type: entry.dfmFile ? (layer === 'data' ? 'DataModule' : 'Form') : 'Unit',
        projectId,
        layer,
        paths: [entry.pasFile, entry.dfmFile].filter(Boolean) as string[],
        publicSymbols: publicSymbols.slice(0, 10),
        loc,
        fanIn: 0,
        fanOut: 0,
        hasTests: unitName.includes('test'),
        isKey: entry.isForm || layer === 'data',
        confidence: 'Extracted',
        evidence,
        language: 'Delphi',
      };

      ctx.archModel.components.push(comp);
    }
  }
}
