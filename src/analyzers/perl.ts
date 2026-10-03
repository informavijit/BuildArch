import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import perlRulePack from '../rules/perl.json';

export class PerlAnalyzer implements Analyzer {
  public id = 'perl';
  public name = 'Perl Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (perlRulePack as any).default || perlRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.pl', '.pm', '.t'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const perlFiles = ctx.files.filter(f => ['.pl', '.pm', '.t'].includes(f.extension.toLowerCase()));
    const perlProject = ctx.archModel.projects.find(p => p.languages.some(l => ['.pl', '.pm'].includes(l))) || ctx.archModel.projects[0];
    const projectId = perlProject ? perlProject.id : 'project-perl';

    for (const file of perlFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.pl');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));

      for (const extCall of facts.externalCalls) {
        if (extCall.type === 'System Call') {
          ctx.archModel.relationships.push({
            id: `rel-perl-sys-${file.relativePath}-${extCall.line}`,
            fromId: `comp-perl-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            toId: `sys-${extCall.name}`,
            kind: 'process-call',
            label: `Perl system/exec call: ${extCall.name}`,
            evidence: [{ file: file.relativePath, line: extCall.line, snippet: extCall.snippet }],
            confidence: 'Extracted',
          });
        }
      }

      ctx.archModel.components.push({
        id: `comp-perl-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: file.extension.toLowerCase() === '.pm' ? 'Perl Module' : 'Perl Script',
        projectId,
        layer: file.extension.toLowerCase() === '.pm' ? 'domain' : 'application',
        paths: [file.relativePath],
        publicSymbols: facts.declarations.map(d => d.name),
        loc: facts.loc,
        fanIn: 0,
        fanOut: facts.imports.length,
        hasTests: file.extension.toLowerCase() === '.t' || file.relativePath.toLowerCase().includes('t/'),
        isKey: file.extension.toLowerCase() === '.pm',
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: 'Perl',
      });
    }
  }
}
