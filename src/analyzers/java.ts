import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent, ArchInterface } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import javaRulePack from '../rules/java.json';

export class JavaAnalyzer implements Analyzer {
  public id = 'java';
  public name = 'Java & Spring Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (javaRulePack as any).default || javaRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.extension.toLowerCase() === '.java' || f.relativePath.toLowerCase().endsWith('pom.xml'));
  }

  public analyze(ctx: AnalysisContext): void {
    const javaFiles = ctx.files.filter(f => f.extension.toLowerCase() === '.java');
    const javaProject = ctx.archModel.projects.find(p => p.languages.includes('.java')) || ctx.archModel.projects[0];
    const projectId = javaProject ? javaProject.id : 'project-java';

    for (const file of javaFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.java');
      const compName = path.basename(file.relativePath, '.java');

      let layer: ArchComponent['layer'] = 'domain';
      let compType = 'Class';

      if (facts.routes.length > 0 || compName.endsWith('Controller')) {
        layer = 'presentation';
        compType = 'Controller';
      } else if (compName.endsWith('Service')) {
        layer = 'application';
        compType = 'Service';
      } else if (compName.endsWith('Repository') || facts.dataAccess.length > 0) {
        layer = 'data';
        compType = 'Repository';
      }

      for (const route of facts.routes) {
        if (route.detail || route.name) {
          ctx.archModel.interfaces.push({
            id: `iface-java-${file.relativePath}-${route.line}`,
            projectId,
            kind: 'rest',
            method: route.detail?.split(' ')[0] || 'GET',
            path: route.name || route.detail || '/api',
            handler: `${compName}.${route.name || 'endpoint'}`,
            file: file.relativePath,
            line: route.line,
          });
        }
      }

      ctx.archModel.components.push({
        id: `comp-java-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
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
        language: 'Java',
      });
    }
  }
}
