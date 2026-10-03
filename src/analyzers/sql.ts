import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import sqlRulePack from '../rules/sql.json';

export class SqlAnalyzer implements Analyzer {
  public id = 'sql';
  public name = 'SQL & Migration Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (sqlRulePack as any).default || sqlRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.sql', '.prc', '.pks', '.pkb'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const sqlFiles = ctx.files.filter(f => ['.sql', '.prc', '.pks', '.pkb'].includes(f.extension.toLowerCase()));

    for (const file of sqlFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.sql');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));

      const models = facts.dataAccess.map(d => d.name);

      if (models.length > 0) {
        ctx.archModel.dataStores.push({
          id: `datastore-sql-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
          name: compName,
          kind: 'relational',
          technology: 'SQL Schema / Migration',
          usedBy: [],
          models,
          evidence: [{ file: file.relativePath }],
        });
      }
    }
  }
}
