import { ArchModel } from '../model/archModel.js';

/**
 * Tarjan's Strongly Connected Components algorithm for circular dependency detection.
 */
export function detectCycles(archModel: ArchModel): void {
  const adj = new Map<string, Set<string>>();

  for (const comp of archModel.components) {
    adj.set(comp.id, new Set());
  }

  for (const rel of archModel.relationships) {
    if (adj.has(rel.fromId) && adj.has(rel.toId) && rel.fromId !== rel.toId) {
      adj.get(rel.fromId)!.add(rel.toId);
    }
  }

  let index = 0;
  const indices = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Map<string, boolean>();
  const stack: string[] = [];
  const sccs: string[][] = [];

  function strongConnect(v: string) {
    indices.set(v, index);
    lowlink.set(v, index);
    index++;
    stack.push(v);
    onStack.set(v, true);

    const neighbors = adj.get(v) || new Set();
    for (const w of neighbors) {
      if (!indices.has(w)) {
        strongConnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.get(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, indices.get(w)!));
      }
    }

    if (lowlink.get(v) === indices.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.set(w, false);
        scc.push(w);
      } while (w !== v);

      if (scc.length > 1) {
        sccs.push(scc);
      }
    }
  }

  for (const node of adj.keys()) {
    if (!indices.has(node)) {
      strongConnect(node);
    }
  }

  archModel.quality.cycles = sccs;

  for (const scc of sccs) {
    const names = scc.map(id => archModel.components.find(c => c.id === id)?.name || id);
    archModel.quality.risks.push({
      id: `risk-cycle-${scc.join('-')}`,
      severity: 'high',
      category: 'cycle',
      title: 'Circular Dependency Cycle Detected',
      description: `Circular coupling detected between components: ${names.join(' -> ')} -> ${names[0]}`,
      affectedComponents: scc,
      evidence: scc.map(id => ({ file: archModel.components.find(c => c.id === id)?.paths[0] || id })),
    });
  }
}
