import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { AnalysisPipeline } from '../../src/pipeline/orchestrator.js';

describe('Generate Fresh Workspace Report', () => {
  it('generates a fresh BuildArch-architecture-20261003.html report with full CSS embedded', async () => {
    const workspacePath = path.resolve(__dirname, '../../');
    const pipeline = new AnalysisPipeline();
    const { htmlReport, archModel } = await pipeline.run({
      workspacePath,
      workspaceName: 'BuildArch',
      isAiMode: false,
    });

    const outputPath = path.join(workspacePath, 'BuildArch-architecture-20261003.html');
    fs.writeFileSync(outputPath, htmlReport, 'utf-8');

    // Assert that style tag contains actual CSS rules and NOT [object Object]
    expect(htmlReport).not.toContain('[object Object]');
    expect(htmlReport).toContain('--orange: #FF6B35');
    expect(htmlReport).toContain('--dark: #0B0B14');
    expect(htmlReport).toContain('.header-badge');
    expect(htmlReport).toContain('.card.orange');
    expect(htmlReport).toContain('.hub');
    expect(htmlReport).toContain('.ext-card');
  });
});
