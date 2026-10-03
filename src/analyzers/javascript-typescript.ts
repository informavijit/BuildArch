import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import jsTsRulePack from '../rules/js-ts.json';

export class JavaScriptTypeScriptAnalyzer implements Analyzer {
  public id = 'javascript-typescript';
  public name = 'JavaScript, TypeScript, React.js, Angular & Node.js Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (jsTsRulePack as any).default || jsTsRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const jsFiles = ctx.files.filter(f => ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.vue', '.svelte'].includes(f.extension.toLowerCase()));
    const jsProject = ctx.archModel.projects.find(p => p.languages.some(l => ['.js', '.ts', '.jsx', '.tsx'].includes(l))) || ctx.archModel.projects[0];
    const projectId = jsProject ? jsProject.id : 'project-js-ts';

    for (const file of jsFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.ts');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));
      const ext = file.extension.toLowerCase();

      let layer: ArchComponent['layer'] = 'application';
      let compType = 'JavaScript Module';
      let detectedFramework = 'Node.js / JS';

      if (['.jsx', '.tsx'].includes(ext) || text.includes('React') || text.includes('useContext') || text.includes('useState') || facts.declarations.some(d => d.type === 'React Component')) {
        layer = 'presentation';
        compType = 'React Component';
        detectedFramework = 'React.js';
      } else if (text.includes('@Component') || text.includes('@Injectable') || text.includes('angular.module') || facts.declarations.some(d => d.type?.includes('Angular'))) {
        layer = 'presentation';
        compType = text.includes('angular.module') ? 'AngularJS Component' : 'Angular Component';
        detectedFramework = text.includes('angular.module') ? 'AngularJS' : 'Angular';
      } else if (facts.routes.length > 0 || compName.includes('controller') || compName.includes('route') || compName.includes('server') || compName.includes('app')) {
        layer = 'presentation';
        compType = 'Node.js REST Route / Controller';
        detectedFramework = 'Node.js / Express';
      } else if (compName.includes('service') || compName.includes('store') || compName.includes('hook') || compName.startsWith('use')) {
        layer = 'application';
        compType = 'Service / Hook';
      } else if (compName.includes('repository') || compName.includes('model') || compName.includes('db') || compName.includes('prisma')) {
        layer = 'data';
        compType = 'Repository / Model';
      }

      for (const route of facts.routes) {
        ctx.archModel.interfaces.push({
          id: `iface-js-${file.relativePath}-${route.line}`,
          projectId,
          kind: 'rest',
          method: route.method || 'GET',
          path: route.name || '/api',
          handler: `${compName}.${route.name || 'handler'}`,
          file: file.relativePath,
          line: route.line,
        });
      }

      for (const extCall of facts.externalCalls) {
        if (extCall.type?.includes('HTTP')) {
          ctx.archModel.relationships.push({
            id: `rel-js-http-${file.relativePath}-${extCall.line}`,
            fromId: `comp-js-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            toId: `http-${extCall.name}`,
            kind: 'http',
            label: `HTTP Client call: ${extCall.name}`,
            evidence: [{ file: file.relativePath, line: extCall.line, snippet: extCall.snippet }],
            confidence: 'Extracted',
          });
        }
      }

      ctx.archModel.components.push({
        id: `comp-js-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: compType,
        projectId,
        layer,
        paths: [file.relativePath],
        publicSymbols: facts.declarations.map(d => d.name),
        loc: facts.loc,
        fanIn: 0,
        fanOut: facts.imports.length,
        hasTests: file.relativePath.toLowerCase().includes('test') || file.relativePath.toLowerCase().includes('spec'),
        isKey: layer === 'presentation' || layer === 'data',
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: detectedFramework,
      });
    }
  }
}
