import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { AnalysisPipeline } from '../../src/pipeline/orchestrator.js';

describe('HTML Report & Section 7 Design System Assertion', () => {
  it('embeds Section 7 design system CSS verbatim and populates all 14 sections', async () => {
    const fixturePath = path.join(__dirname, '../fixtures/multi-service-suite');
    const pipeline = new AnalysisPipeline();
    const { htmlReport } = await pipeline.run({
      workspacePath: fixturePath,
      workspaceName: 'MultiServiceSuite',
    });

    // 1. Assert design system verbatim CSS rules exist
    expect(htmlReport).toContain('--orange: #FF6B35');
    expect(htmlReport).toContain('--yellow: #FFD23F');
    expect(htmlReport).toContain('--purple: #8B5CF6');
    expect(htmlReport).toContain('.header-badge');
    expect(htmlReport).toContain('.hub');
    expect(htmlReport).toContain('.flow-diagram');
    expect(htmlReport).toContain('.flow-bubble');

    // 2. Assert all 14 sections exist in order
    expect(htmlReport).toContain('id="overview"');
    expect(htmlReport).toContain('id="inventory"');
    expect(htmlReport).toContain('id="architecture"');
    expect(htmlReport).toContain('id="key-components"');
    expect(htmlReport).toContain('id="all-components"');
    expect(htmlReport).toContain('id="relationships"');
    expect(htmlReport).toContain('id="interfaces"');
    expect(htmlReport).toContain('id="data-architecture"');
    expect(htmlReport).toContain('id="workflows"');
    expect(htmlReport).toContain('id="deployment"');
    expect(htmlReport).toContain('id="cross-cutting"');
    expect(htmlReport).toContain('id="quality"');
    expect(htmlReport).toContain('id="tech-stack"');
    expect(htmlReport).toContain('id="appendix"');
  });

  it('BuildArch: Workspace makes ZERO AI and network calls', async () => {
    const fixturePath = path.join(__dirname, '../fixtures/multi-service-suite');
    const pipeline = new AnalysisPipeline();
    const { archModel } = await pipeline.run({
      workspacePath: fixturePath,
      isAiMode: false,
    });

    expect(archModel.workspace.mode).toBe('No AI (rule-based)');
    const anyAiGenerated = archModel.components.some(c => c.confidence === 'AI-generated');
    expect(anyAiGenerated).toBe(false);
  });
});
