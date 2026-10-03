import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import powershellRulePack from '../rules/powershell.json';

export class PowerShellAnalyzer implements Analyzer {
  public id = 'powershell';
  public name = 'PowerShell Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (powershellRulePack as any).default || powershellRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.ps1', '.psm1', '.psd1'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const psFiles = ctx.files.filter(f => ['.ps1', '.psm1', '.psd1'].includes(f.extension.toLowerCase()));
    const psProject = ctx.archModel.projects.find(p => p.languages.some(l => ['.ps1', '.psm1'].includes(l))) || ctx.archModel.projects[0];
    const projectId = psProject ? psProject.id : 'project-powershell';

    for (const file of psFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.ps1');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));

      for (const extCall of facts.externalCalls) {
        if (extCall.type === 'Process Call') {
          ctx.archModel.relationships.push({
            id: `rel-ps-proc-${file.relativePath}-${extCall.line}`,
            fromId: `comp-ps-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            toId: `proc-${extCall.name}`,
            kind: 'process-call',
            label: `PowerShell process call: ${extCall.name}`,
            evidence: [{ file: file.relativePath, line: extCall.line, snippet: extCall.snippet }],
            confidence: 'Extracted',
          });
        }
      }

      ctx.archModel.components.push({
        id: `comp-ps-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: file.extension.toLowerCase() === '.psm1' ? 'PowerShell Module' : 'PowerShell Script',
        projectId,
        layer: 'infrastructure',
        paths: [file.relativePath],
        publicSymbols: facts.declarations.map(d => d.name),
        loc: facts.loc,
        fanIn: 0,
        fanOut: facts.imports.length,
        hasTests: file.relativePath.toLowerCase().includes('tests'),
        isKey: facts.externalCalls.length > 0 || file.extension.toLowerCase() === '.psm1',
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: 'PowerShell',
      });
    }
  }
}
