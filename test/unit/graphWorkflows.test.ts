import { describe, it, expect } from 'vitest';
import { createEmptyArchModel } from '../../src/model/archModel.js';
import { detectCycles } from '../../src/graph/cycles.js';
import { traceMajorWorkflows } from '../../src/graph/workflows.js';

describe('Graph & Workflow Algorithms', () => {
  it('detects circular dependency cycles using Tarjan SCC algorithm', () => {
    const model = createEmptyArchModel('CycleTest');
    model.components.push(
      { id: 'comp-a', name: 'ServiceA', type: 'Service', projectId: 'p1', layer: 'application', paths: ['a.ts'], publicSymbols: [], loc: 10, fanIn: 1, fanOut: 1, hasTests: false, isKey: false, confidence: 'Extracted', evidence: [] },
      { id: 'comp-b', name: 'ServiceB', type: 'Service', projectId: 'p1', layer: 'application', paths: ['b.ts'], publicSymbols: [], loc: 10, fanIn: 1, fanOut: 1, hasTests: false, isKey: false, confidence: 'Extracted', evidence: [] }
    );

    model.relationships.push(
      { id: 'rel-1', fromId: 'comp-a', toId: 'comp-b', kind: 'import', label: 'depends on', evidence: [], confidence: 'Extracted' },
      { id: 'rel-2', fromId: 'comp-b', toId: 'comp-a', kind: 'import', label: 'depends on', evidence: [], confidence: 'Extracted' }
    );

    detectCycles(model);

    expect(model.quality.cycles.length).toBe(1);
    expect(model.quality.risks.some(r => r.category === 'cycle')).toBe(true);
  });

  it('traces ordered step chains for major workflows starting from triggers', () => {
    const model = createEmptyArchModel('WorkflowTest');
    model.components.push(
      { id: 'comp-ctrl', name: 'OrderController', type: 'Controller', projectId: 'p1', layer: 'presentation', paths: ['ctrl.ts'], publicSymbols: [], loc: 20, fanIn: 0, fanOut: 1, hasTests: true, isKey: true, confidence: 'Extracted', evidence: [] },
      { id: 'comp-svc', name: 'OrderService', type: 'Service', projectId: 'p1', layer: 'domain', paths: ['svc.ts'], publicSymbols: [], loc: 30, fanIn: 1, fanOut: 1, hasTests: true, isKey: false, confidence: 'Extracted', evidence: [] }
    );

    model.interfaces.push({
      id: 'iface-1',
      projectId: 'p1',
      kind: 'rest',
      method: 'POST',
      path: '/orders',
      handler: 'OrderController.createOrder',
      file: 'ctrl.ts',
    });

    model.relationships.push({
      id: 'r1',
      fromId: 'comp-ctrl',
      toId: 'comp-svc',
      kind: 'import',
      label: 'calls',
      evidence: [],
      confidence: 'Extracted',
    });

    traceMajorWorkflows(model);

    expect(model.workflows.length).toBeGreaterThan(0);
    expect(model.workflows[0].steps.length).toBe(2);
  });
});
