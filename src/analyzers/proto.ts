import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';

export class ProtoAnalyzer implements Analyzer {
  public id = 'proto';
  public name = 'gRPC Proto Schema Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => f.extension.toLowerCase() === '.proto');
  }

  public analyze(ctx: AnalysisContext): void {
    const protoFiles = ctx.files.filter(f => f.extension.toLowerCase() === '.proto');

    for (const file of protoFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const serviceMatches = text.matchAll(/service\s+([a-zA-Z0-9_]+)\s*\{([^}]+)\}/g);

      for (const sm of serviceMatches) {
        const serviceName = sm[1];
        const body = sm[2];
        const rpcMatches = body.matchAll(/rpc\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*returns\s*\(([^)]+)\)/g);

        for (const rpc of rpcMatches) {
          ctx.archModel.interfaces.push({
            id: `iface-proto-${file.relativePath}-${rpc.index}`,
            projectId: ctx.archModel.projects[0]?.id || 'project-grpc',
            kind: 'grpc',
            method: 'gRPC',
            path: `${serviceName}/${rpc[1]}`,
            handler: rpc[1],
            file: file.relativePath,
          });
        }
      }
    }
  }
}
