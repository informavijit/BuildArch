import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchComponent } from '../model/archModel.js';

export class MultiLanguageAnalyzer implements Analyzer {
  public id = 'multi-lang';
  public name = 'Go, Rust, Kotlin, Swift, PHP, Ruby Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => ['.go', '.rs', '.kt', '.kts', '.swift', '.php', '.rb'].includes(f.extension.toLowerCase()));
  }

  public analyze(ctx: AnalysisContext): void {
    const targetFiles = ctx.files.filter(f => ['.go', '.rs', '.kt', '.kts', '.swift', '.php', '.rb'].includes(f.extension.toLowerCase()));
    const proj = ctx.archModel.projects[0] || { id: 'project-multi' };

    for (const file of targetFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const lines = text.split(/\r?\n/);
      const loc = lines.filter(l => l.trim().length > 0).length;
      const compName = path.basename(file.relativePath, path.extname(file.relativePath));
      const ext = file.extension.toLowerCase();

      let langName = 'Other';
      if (ext === '.go') langName = 'Go';
      else if (ext === '.rs') langName = 'Rust';
      else if (ext === '.kt' || ext === '.kts') langName = 'Kotlin';
      else if (ext === '.swift') langName = 'Swift';
      else if (ext === '.php') langName = 'PHP';
      else if (ext === '.rb') langName = 'Ruby';

      ctx.archModel.components.push({
        id: `comp-multi-${file.relativePath.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: compName,
        type: `${langName} Module`,
        projectId: proj.id,
        layer: 'domain',
        paths: [file.relativePath],
        publicSymbols: [],
        loc,
        fanIn: 0,
        fanOut: 0,
        hasTests: file.relativePath.toLowerCase().includes('test') || file.relativePath.toLowerCase().includes('spec'),
        isKey: compName === 'main' || compName === 'app' || compName === 'index',
        confidence: 'Extracted',
        evidence: [{ file: file.relativePath }],
        language: langName,
      });
    }
  }
}
