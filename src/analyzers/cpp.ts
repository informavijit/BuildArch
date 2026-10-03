import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import cppRulePack from '../rules/cpp.json';

export class CppAnalyzer implements Analyzer {
  public id = 'cpp';
  public name = 'C / C++ Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (cppRulePack as any).default || cppRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.c', '.cc', '.cpp', '.cxx', '.h', '.hpp'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const cppFiles = ctx.files.filter(f => ['.c', '.cc', '.cpp', '.cxx', '.h', '.hpp'].includes(f.extension.toLowerCase()));
    const cppProject = ctx.archModel.projects.find(p => p.frameworks.some(f => f.includes('C/C++'))) || ctx.archModel.projects[0];
    const projectId = cppProject ? cppProject.id : 'project-cpp';

    for (const file of cppFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.cpp');
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));

      const isHeader = ['.h', '.hpp'].includes(file.extension.toLowerCase());

      ctx.archModel.components.push({
        id: `comp-cpp-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: isHeader ? 'Header' : 'Source Module',
        projectId,
        layer: 'infrastructure',
        paths: [file.relativePath],
        publicSymbols: facts.declarations.map(d => d.name),
        loc: facts.loc,
        fanIn: 0,
        fanOut: facts.imports.length,
        hasTests: file.relativePath.toLowerCase().includes('test'),
        isKey: facts.entryPoints.length > 0 || facts.externalCalls.length > 0,
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: 'C++',
      });
    }
  }
}
