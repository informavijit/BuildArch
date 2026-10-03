import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';

export class DockerAnalyzer implements Analyzer {
  public id = 'docker';
  public name = 'Docker & Compose Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => {
      const b = path.basename(f.relativePath).toLowerCase();
      return b === 'dockerfile' || b.startsWith('docker-compose');
    });
  }

  public analyze(ctx: AnalysisContext): void {
    const dockerFiles = ctx.files.filter(f => {
      const b = path.basename(f.relativePath).toLowerCase();
      return b === 'dockerfile' || b.startsWith('docker-compose');
    });

    for (const file of dockerFiles) {
      const b = path.basename(file.relativePath).toLowerCase();
      const text = ctx.fileTextCache.get(file.absolutePath) || '';

      if (b.startsWith('docker-compose')) {
        ctx.archModel.deployment.artifacts.push({
          name: b,
          type: 'docker',
          path: file.relativePath,
          details: 'Multi-container Docker Compose topology specification',
        });

        // Extract services from docker-compose
        const serviceMatches = text.matchAll(/^\s{2}([a-zA-Z0-9_-]+):/gm);
        for (const m of serviceMatches) {
          if (m[1] && m[1] !== 'version' && m[1] !== 'services' && m[1] !== 'networks' && m[1] !== 'volumes') {
            ctx.archModel.deployment.topology.push(`Service: ${m[1]} (Docker Compose)`);
          }
        }
      } else {
        ctx.archModel.deployment.artifacts.push({
          name: b,
          type: 'docker',
          path: file.relativePath,
          details: 'Container image Dockerfile build specification',
        });
      }
    }
  }
}
