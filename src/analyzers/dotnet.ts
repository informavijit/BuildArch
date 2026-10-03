import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import csharpRulePack from '../rules/csharp.json';

export class DotNetAnalyzer implements Analyzer {
  public id = 'dotnet';
  public name = 'C# / .NET Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (csharpRulePack as any).default || csharpRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.cs', '.vb', '.fs', '.csproj', '.sln'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const csFiles = ctx.files.filter(f => ['.cs', '.vb', '.fs'].includes(f.extension.toLowerCase()));
    const dotnetProject = ctx.archModel.projects.find(p => p.languages.some(l => ['.cs', '.csproj'].includes(l))) || ctx.archModel.projects[0];
    const projectId = dotnetProject ? dotnetProject.id : 'project-dotnet';

    for (const file of csFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.cs');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));

      let layer: ArchComponent['layer'] = 'domain';
      let compType = 'Class';

      if (facts.routes.length > 0 || compName.endsWith('Controller')) {
        layer = 'presentation';
        compType = 'Controller';
      } else if (compName.endsWith('Service') || compName.endsWith('Manager')) {
        layer = 'application';
        compType = 'Service';
      } else if (compName.endsWith('Context') || compName.endsWith('Repository') || facts.dataAccess.length > 0) {
        layer = 'data';
        compType = 'DbContext / Repository';
      }

      for (const route of facts.routes) {
        ctx.archModel.interfaces.push({
          id: `iface-cs-${file.relativePath}-${route.line}`,
          projectId,
          kind: 'rest',
          method: route.detail || 'GET',
          path: route.name || '/api',
          handler: `${compName}.${route.name || 'Action'}`,
          file: file.relativePath,
          line: route.line,
        });
      }

      for (const extCall of facts.externalCalls) {
        if (extCall.type === 'DllImport') {
          ctx.archModel.relationships.push({
            id: `rel-cs-pinvoke-${file.relativePath}-${extCall.line}`,
            fromId: `comp-cs-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            toId: `external-${extCall.name}`,
            kind: 'native-dll',
            label: `C# P/Invoke DllImport: ${extCall.name}`,
            evidence: [{ file: file.relativePath, line: extCall.line, snippet: extCall.snippet }],
            confidence: 'Extracted',
          });
        }
      }

      ctx.archModel.components.push({
        id: `comp-cs-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
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
        language: 'C#',
      });
    }
  }
}
