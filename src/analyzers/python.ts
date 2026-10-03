import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import pythonRulePack from '../rules/python.json';

export class PythonAnalyzer implements Analyzer {
  public id = 'python';
  public name = 'Python Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (pythonRulePack as any).default || pythonRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.extension.toLowerCase() === '.py');
  }

  public analyze(ctx: AnalysisContext): void {
    const pyFiles = ctx.files.filter(f => f.extension.toLowerCase() === '.py');
    const pyProject = ctx.archModel.projects.find(p => p.languages.includes('.py')) || ctx.archModel.projects[0];
    const projectId = pyProject ? pyProject.id : 'project-python';

    for (const file of pyFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.py');
      const compName = path.basename(file.relativePath, '.py');

      let layer: ArchComponent['layer'] = 'domain';
      let compType = 'Module';

      if (facts.routes.length > 0 || compName.includes('router') || compName.includes('views') || compName.includes('api')) {
        layer = 'presentation';
        compType = 'API Routes / Views';
      } else if (compName.includes('service') || compName.includes('task')) {
        layer = 'application';
        compType = 'Service / Tasks';
      } else if (facts.dataAccess.length > 0 || compName.includes('model')) {
        layer = 'data';
        compType = 'SQLAlchemy Model / Repo';
      }

      for (const route of facts.routes) {
        ctx.archModel.interfaces.push({
          id: `iface-py-${file.relativePath}-${route.line}`,
          projectId,
          kind: 'rest',
          method: route.method || 'GET',
          path: route.name || '/api',
          handler: `${compName}.${route.name || 'endpoint'}`,
          file: file.relativePath,
          line: route.line,
        });
      }

      ctx.archModel.components.push({
        id: `comp-py-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: compType,
        projectId,
        layer,
        paths: [file.relativePath],
        publicSymbols: facts.declarations.map(d => d.name),
        loc: facts.loc,
        fanIn: 0,
        fanOut: facts.imports.length,
        hasTests: file.relativePath.toLowerCase().includes('test'),
        isKey: layer === 'presentation' || layer === 'data',
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: 'Python',
      });
    }
  }
}
