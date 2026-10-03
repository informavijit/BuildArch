import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';

export class K8sAnalyzer implements Analyzer {
  public id = 'k8s';
  public name = 'Kubernetes & Helm Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.relativePath.includes('k8s') || f.relativePath.includes('helm') || f.relativePath.endsWith('Chart.yaml'));
  }

  public analyze(ctx: AnalysisContext): void {
    const k8sFiles = ctx.files.filter(f => f.relativePath.includes('k8s') || f.relativePath.includes('helm') || f.relativePath.endsWith('Chart.yaml'));

    for (const file of k8sFiles) {
      ctx.archModel.deployment.artifacts.push({
        name: path.basename(file.relativePath),
        type: file.relativePath.endsWith('Chart.yaml') ? 'helm' : 'k8s',
        path: file.relativePath,
        details: 'Kubernetes / Helm infrastructure specification',
      });
    }
  }
}
