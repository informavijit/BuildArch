import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import genericRulePack from '../rules/generic.json';

export class GenericFallbackAnalyzer implements Analyzer {
  public id = 'generic-fallback';
  public name = 'Generic Fallback Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (genericRulePack as any).default || genericRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(_ctx: AnalysisContext): boolean {
    return true; // Always runs for unhandled files
  }

  public analyze(ctx: AnalysisContext): void {
    const existingCompFiles = new Set<string>();
    for (const comp of ctx.archModel.components) {
      for (const p of comp.paths) {
        existingCompFiles.add(p);
      }
    }

    const unanalyzedFiles = ctx.files.filter(f => !existingCompFiles.has(f.relativePath));

    for (const file of unanalyzedFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, 'generic');
      const baseName = path.basename(file.relativePath, path.extname(file.relativePath));
      const proj = ctx.archModel.projects[0] || { id: 'project-generic' };
      const ext = file.extension.toLowerCase();

      // Format a clean human-readable name
      let formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      formattedName = formattedName.replace(/[-_]([a-z])/g, (_, c) => ' ' + c.toUpperCase());

      let compType = 'Source Module';
      let layer: 'presentation' | 'application' | 'domain' | 'data' | 'infrastructure' = 'domain';

      if (['.md', '.txt', '.doc'].includes(ext)) {
        compType = 'Documentation';
        layer = 'domain';
      } else if (['.json', '.yaml', '.yml', '.ini', '.toml'].includes(ext)) {
        compType = 'Configuration Schema';
        layer = 'infrastructure';
      } else if (['.css', '.scss', '.less', '.html'].includes(ext)) {
        compType = 'UI Style Template';
        layer = 'presentation';
      } else if (file.relativePath.includes('test') || file.relativePath.includes('spec')) {
        compType = 'Unit Test Suite';
        layer = 'application';
      }

      if (facts.loc > 3) {
        ctx.archModel.components.push({
          id: `comp-gen-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
          name: formattedName,
          type: compType,
          projectId: proj.id,
          layer,
          paths: [file.relativePath],
          publicSymbols: facts.declarations.map(d => d.name),
          loc: facts.loc,
          fanIn: 0,
          fanOut: facts.imports.length,
          hasTests: file.relativePath.toLowerCase().includes('test'),
          isKey: false,
          confidence: 'Inferred',
          evidence: [{ file: file.relativePath }],
          language: file.extension || 'Generic',
        });
      }
    }
  }
}
