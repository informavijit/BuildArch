import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';

export class CiAnalyzer implements Analyzer {
  public id = 'ci';
  public name = 'CI/CD Pipeline Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.relativePath.startsWith('.github/workflows') || f.relativePath.includes('azure-pipelines') || f.relativePath.endsWith('Jenkinsfile') || f.relativePath.endsWith('.gitlab-ci.yml'));
  }

  public analyze(ctx: AnalysisContext): void {
    const ciFiles = ctx.files.filter(f => f.relativePath.startsWith('.github/workflows') || f.relativePath.includes('azure-pipelines') || f.relativePath.endsWith('Jenkinsfile') || f.relativePath.endsWith('.gitlab-ci.yml'));

    for (const file of ciFiles) {
      const b = path.basename(file.relativePath);
      ctx.archModel.deployment.pipelines.push(`CI Pipeline: ${b} (${file.relativePath})`);
      ctx.archModel.deployment.artifacts.push({
        name: b,
        type: 'ci-pipeline',
        path: file.relativePath,
        details: 'Automated CI/CD Workflow Pipeline',
      });
    }
  }
}
