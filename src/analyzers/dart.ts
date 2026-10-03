import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';
import { RegexRuleEngine } from '../languages/regex-engine.js';
import dartRulePack from '../rules/dart.json';

export class DartAnalyzer implements Analyzer {
  public id = 'dart';
  public name = 'Dart / Flutter Analyzer';
  private engine = new RegexRuleEngine();

  constructor() {
    const pack = (dartRulePack as any).default || dartRulePack;
    this.engine.registerRulePack(pack);
  }

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.extension.toLowerCase() === '.dart' || f.relativePath.toLowerCase().endsWith('pubspec.yaml'));
  }

  public analyze(ctx: AnalysisContext): void {
    const dartFiles = ctx.files.filter(f => f.extension.toLowerCase() === '.dart');
    const dartProject = ctx.archModel.projects.find(p => p.languages.includes('.dart')) || ctx.archModel.projects[0];
    const projectId = dartProject ? dartProject.id : 'project-flutter';

    for (const file of dartFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const facts = this.engine.analyze(file.relativePath, text, '.dart');
      const compName = path.basename(file.relativePath, '.dart');

      let layer: ArchComponent['layer'] = 'domain';
      let compType = 'Class';

      if (facts.declarations.some(d => ['StatelessWidget', 'StatefulWidget', 'ConsumerWidget'].includes(d.type || '')) || compName.includes('screen') || compName.includes('page') || compName.includes('widget')) {
        layer = 'presentation';
        compType = 'Flutter Screen / Widget';
      } else if (compName.includes('bloc') || compName.includes('provider') || compName.includes('cubit') || compName.includes('state')) {
        layer = 'application';
        compType = 'State Management (Bloc/Provider)';
      } else if (compName.includes('repository') || compName.includes('api') || compName.includes('service') || facts.externalCalls.length > 0) {
        layer = 'data';
        compType = 'Repository / API Client';
      }

      for (const extCall of facts.externalCalls) {
        if (extCall.type === 'HTTP Client') {
          ctx.archModel.relationships.push({
            id: `rel-dart-http-${file.relativePath}-${extCall.line}`,
            fromId: `comp-dart-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            toId: `http-${extCall.name}`,
            kind: 'http',
            label: `Flutter HTTP/Dio Client call: ${extCall.name}`,
            evidence: [{ file: file.relativePath, line: extCall.line, snippet: extCall.snippet }],
            confidence: 'Extracted',
          });
        }
      }

      ctx.archModel.components.push({
        id: `comp-dart-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
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
        language: 'Dart/Flutter',
      });
    }
  }
}
