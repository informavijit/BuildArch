import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { AnalysisPipeline } from '../../src/pipeline/orchestrator.js';

describe('Delphi Analyzer & DFM Pairing', () => {
  it('pairs Delphi .dfm and .pas files, extracting form controls and DB components', async () => {
    const fixturePath = path.join(__dirname, '../fixtures/delphi-project');
    const pipeline = new AnalysisPipeline();
    const { archModel } = await pipeline.run({
      workspacePath: fixturePath,
      workspaceName: 'DelphiProjectFixture',
    });

    const mainFormComp = archModel.components.find(c => c.name.toLowerCase() === 'mainform');
    expect(mainFormComp).toBeDefined();
    expect(mainFormComp?.paths.length).toBe(2); // paired .pas and .dfm
    expect(archModel.dataStores.length).toBeGreaterThan(0);
    expect(archModel.relationships.some(r => r.kind === 'native-dll')).toBe(true);
  });
});
