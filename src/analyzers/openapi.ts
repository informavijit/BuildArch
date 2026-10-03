import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';

export class OpenApiAnalyzer implements Analyzer {
  public id = 'openapi';
  public name = 'OpenAPI & Swagger Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.relativePath.toLowerCase().includes('openapi') || f.relativePath.toLowerCase().includes('swagger'));
  }

  public analyze(ctx: AnalysisContext): void {
    const apiFiles = ctx.files.filter(f => f.relativePath.toLowerCase().includes('openapi') || f.relativePath.toLowerCase().includes('swagger'));

    for (const file of apiFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      // Extract paths from swagger/openapi spec
      const pathMatches = text.matchAll(/^\s{2}\/([a-zA-Z0-9_{}/-]+):/gm);
      for (const m of pathMatches) {
        ctx.archModel.interfaces.push({
          id: `iface-openapi-${file.relativePath}-${m.index}`,
          projectId: ctx.archModel.projects[0]?.id || 'project-api',
          kind: 'rest',
          method: 'HTTP',
          path: '/' + m[1],
          handler: 'OpenAPI Schema Handler',
          file: file.relativePath,
        });
      }
    }
  }
}
