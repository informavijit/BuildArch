import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { isSecretKeyName } from '../util/redact.js';

export class ConfigAnalyzer implements Analyzer {
  public id = 'config';
  public name = 'Config & Secret Name Analyzer';

  public detect(ctx: AnalysisContext): boolean {
    return ctx.files.some(f => {
      const b = path.basename(f.relativePath).toLowerCase();
      return b.startsWith('.env') || b.startsWith('appsettings') || b.startsWith('application') || ['.yaml', '.yml', '.json', '.ini', '.toml'].includes(f.extension.toLowerCase());
    });
  }

  public analyze(ctx: AnalysisContext): void {
    const configFiles = ctx.files.filter(f => {
      const b = path.basename(f.relativePath).toLowerCase();
      return b.startsWith('.env') || b.startsWith('appsettings') || b.startsWith('application');
    });

    for (const file of configFiles) {
      const text = ctx.fileTextCache.get(file.absolutePath) || '';
      const lines = text.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        // key=value format (.env)
        const eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
          const key = line.substring(0, eqIdx).trim();
          ctx.archModel.crossCutting.config.push(`Config Key: ${key} (${file.relativePath}:${i + 1})`);
          if (isSecretKeyName(key)) {
            ctx.archModel.quality.risks.push({
              id: `risk-secret-name-${file.relativePath}-${i + 1}`,
              severity: 'low',
              category: 'secret-exposure',
              title: 'Sensitive Configuration Key Detected',
              description: `Configuration key '${key}' in file '${file.relativePath}' is named as a sensitive secret. Ensure values are not stored in raw text.`,
              affectedComponents: [],
              evidence: [{ file: file.relativePath, line: i + 1, snippet: `Key name: ${key}` }],
            });
          }
        }
      }
    }
  }
}
