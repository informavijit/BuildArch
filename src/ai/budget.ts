import * as crypto from 'crypto';
import { ArchModel } from '../model/archModel.js';
import { AiEnrichmentResult } from './provider.js';

const aiCache = new Map<string, AiEnrichmentResult>();

export function estimateTokenCount(archModel: ArchModel): number {
  const compactFacts = getCompactFactsJson(archModel);
  // Rough estimate: ~4 chars per token
  return Math.ceil(compactFacts.length / 4);
}

export function getCompactFactsJson(archModel: ArchModel): string {
  const facts = {
    workspace: archModel.workspace.name,
    projects: archModel.projects.map(p => ({ id: p.id, name: p.name, type: p.type, langs: p.languages })),
    components: archModel.components.slice(0, 50).map(c => ({ id: c.id, name: c.name, type: c.type, layer: c.layer, symbols: c.publicSymbols.slice(0, 5) })),
    interfaces: archModel.interfaces.slice(0, 30).map(i => ({ method: i.method, path: i.path, file: i.file })),
    dataStores: archModel.dataStores.map(d => ({ name: d.name, tech: d.technology })),
    workflows: archModel.workflows.map(w => ({ id: w.id, trigger: w.trigger, steps: w.steps.map(s => s.action) })),
    risks: archModel.quality.risks.map(r => ({ id: r.id, title: r.title, category: r.category })),
  };
  return JSON.stringify(facts);
}

export function getFactsHash(archModel: ArchModel): string {
  const json = getCompactFactsJson(archModel);
  return crypto.createHash('sha256').update(json).digest('hex');
}

export function getCachedEnrichment(archModel: ArchModel): AiEnrichmentResult | undefined {
  const hash = getFactsHash(archModel);
  return aiCache.get(hash);
}

export function setCachedEnrichment(archModel: ArchModel, result: AiEnrichmentResult): void {
  const hash = getFactsHash(archModel);
  aiCache.set(hash, result);
}
