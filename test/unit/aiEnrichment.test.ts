import { describe, it, expect } from 'vitest';
import { createEmptyArchModel } from '../../src/model/archModel.js';
import { estimateTokenCount, getCompactFactsJson, getFactsHash } from '../../src/ai/budget.js';
import { VsCodeLmProvider } from '../../src/ai/vscodeLm.js';

describe('AI Enrichment Module', () => {
  it('computes compact facts JSON and estimates token budget', () => {
    const model = createEmptyArchModel('AiTest');
    model.components.push({
      id: 'comp-1',
      name: 'AuthService',
      type: 'Service',
      projectId: 'p1',
      layer: 'domain',
      paths: ['auth.ts'],
      publicSymbols: ['login', 'verify'],
      loc: 40,
      fanIn: 1,
      fanOut: 1,
      hasTests: true,
      isKey: true,
      confidence: 'Extracted',
      evidence: [],
    });

    const compact = getCompactFactsJson(model);
    expect(compact).toContain('AuthService');

    const est = estimateTokenCount(model);
    expect(est).toBeGreaterThan(0);

    const hash1 = getFactsHash(model);
    const hash2 = getFactsHash(model);
    expect(hash1).toBe(hash2);
  });

  it('runs mock AI enrichment when VS Code LM API is not present, producing clearly labeled narratives', async () => {
    const model = createEmptyArchModel('AiEnrichTest', 'AI-assisted');
    model.components.push({
      id: 'comp-1',
      name: 'PaymentGateway',
      type: 'Service',
      projectId: 'p1',
      layer: 'application',
      paths: ['pay.ts'],
      publicSymbols: [],
      loc: 100,
      fanIn: 2,
      fanOut: 2,
      hasTests: true,
      isKey: true,
      confidence: 'Extracted',
      evidence: [],
    });

    const provider = new VsCodeLmProvider();
    const result = await provider.enrich(model, 10000);

    expect(result.executiveSummary).toBeDefined();
    expect(result.componentPurposes?.['comp-1']).toBeDefined();
    expect(result.tokensUsed).toBeGreaterThan(0);
  });
});
