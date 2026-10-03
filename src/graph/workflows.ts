import { ArchModel, ArchWorkflow, WorkflowStep } from '../model/archModel.js';

export function traceMajorWorkflows(archModel: ArchModel, maxWorkflows = 8): void {
  const workflows: ArchWorkflow[] = [];

  // 1. Identify Triggers (REST Endpoints, Main entry points, Form buttons)
  const triggers: { name: string; file: string; line?: number; compId?: string }[] = [];

  for (const iface of archModel.interfaces) {
    const comp = archModel.components.find(c => c.paths.includes(iface.file));
    triggers.push({
      name: `${iface.method || 'GET'} ${iface.path}`,
      file: iface.file,
      line: iface.line,
      compId: comp?.id,
    });
  }

  for (const comp of archModel.components) {
    if (comp.type.includes('Form') || comp.type.includes('Screen') || comp.isKey) {
      triggers.push({
        name: `UI Workflow (${comp.name})`,
        file: comp.paths[0] || '',
        compId: comp.id,
      });
    }
  }

  // 2. Trace step chains using relationship graph
  const adjMap = new Map<string, string[]>();
  for (const rel of archModel.relationships) {
    const list = adjMap.get(rel.fromId) || [];
    list.push(rel.toId);
    adjMap.set(rel.fromId, list);
  }

  const compMap = new Map(archModel.components.map(c => [c.id, c]));

  let wfIdCount = 1;

  for (const trig of triggers) {
    if (workflows.length >= maxWorkflows) break;
    if (!trig.compId) continue;

    const startComp = compMap.get(trig.compId);
    if (!startComp) continue;

    const steps: WorkflowStep[] = [];
    const visited = new Set<string>();
    const touches: string[] = [];

    let currentId: string | undefined = startComp.id;
    let depth = 1;

    while (currentId && depth <= 6) {
      if (visited.has(currentId)) break;
      visited.add(currentId);
      touches.push(currentId);

      const currComp = compMap.get(currentId);
      if (currComp) {
        steps.push({
          stepNumber: depth,
          componentId: currComp.id,
          action: `${currComp.name} (${currComp.type})`,
          evidence: { file: currComp.paths[0] || trig.file, line: trig.line },
        });
      }

      const nextNodes = adjMap.get(currentId) || [];
      currentId = nextNodes.find(n => !visited.has(n));
      depth++;
    }

    if (steps.length >= 2) {
      workflows.push({
        id: `wf-${wfIdCount++}`,
        name: `Workflow: ${trig.name}`,
        trigger: trig.name,
        steps,
        touches,
        narrative: 'Not AI-enriched. Run BuildArch: Workspace AI for narratives.',
        confidence: 'Extracted',
      });
    }
  }

  archModel.workflows = workflows;
  archModel.workspace.stats.workflowCount = workflows.length;
}
