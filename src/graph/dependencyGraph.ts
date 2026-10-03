import { ArchComponent, ArchRelationship, ArchModel } from '../model/archModel.js';

export function buildDependencyGraph(archModel: ArchModel): void {
  const compMap = new Map<string, ArchComponent>();
  for (const comp of archModel.components) {
    compMap.set(comp.id, comp);
  }

  // 1. Process explicit imports and references
  for (const rel of archModel.relationships) {
    const fromComp = compMap.get(rel.fromId);
    const toComp = compMap.get(rel.toId);
    if (fromComp) fromComp.fanOut++;
    if (toComp) toComp.fanIn++;
  }

  // 2. Identify key components by fan-in/fan-out centrality and role
  for (const comp of archModel.components) {
    if (comp.fanIn >= 3 || comp.fanOut >= 5 || comp.isKey) {
      comp.isKey = true;
    }
  }

  archModel.workspace.stats.componentCount = archModel.components.length;
  archModel.workspace.stats.interfaceCount = archModel.interfaces.length;
  archModel.workspace.stats.dataStoreCount = archModel.dataStores.length;
}
