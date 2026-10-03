import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import shellRulePack from '../rules/shell.json';

export class ShellAnalyzer implements Analyzer {
  public id = 'shell';
  public name = 'Shell Script Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (shellRulePack as any).default || shellRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.sh', '.bash', '.zsh', '.bat', '.cmd'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const shellFiles = ctx.files.filter(f => ['.sh', '.bash', '.zsh', '.bat', '.cmd'].includes(f.extension.toLowerCase()));
    const proj = ctx.archModel.projects[0] || { id: 'project-shell' };

    for (const file of shellFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.sh');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));

      ctx.archModel.components.push({
        id: `comp-shell-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: 'Shell Script',
        projectId: proj.id,
        layer: 'infrastructure',
        paths: [file.relativePath],
        publicSymbols: facts.declarations.map(d => d.name),
        loc: facts.loc,
        fanIn: 0,
        fanOut: facts.imports.length,
        hasTests: false,
        isKey: false,
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: 'Shell',
      });
    }
  }
}
