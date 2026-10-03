import { ArchModel } from '../model/archModel.js';

export function calculateMetricsAndHotspots(archModel: ArchModel): void {
  const totalComps = archModel.components.length;
  if (totalComps === 0) return;

  let totalLoc = 0;
  let testedCount = 0;
  let maxFanInComp = archModel.components[0];
  let maxFanOutComp = archModel.components[0];

  for (const comp of archModel.components) {
    totalLoc += comp.loc;
    if (comp.hasTests) testedCount++;

    if (comp.fanIn > (maxFanInComp?.fanIn || 0)) maxFanInComp = comp;
    if (comp.fanOut > (maxFanOutComp?.fanOut || 0)) maxFanOutComp = comp;

    // Check for God Component risk (high LOC and high symbols/connections)
    if (comp.loc > 500 || comp.publicSymbols.length > 20) {
      archModel.quality.hotspots.push({
        componentId: comp.id,
        reason: `God Component risk: ${comp.loc} LOC, ${comp.publicSymbols.length} public symbols.`,
      });

      archModel.quality.risks.push({
        id: `risk-god-${comp.id}`,
        severity: 'medium',
        category: 'god-component',
        title: `God Component Hotspot: ${comp.name}`,
        description: `Component '${comp.name}' has high LOC (${comp.loc}) and large public surface area (${comp.publicSymbols.length} symbols), making it difficult to maintain and test.`,
        affectedComponents: [comp.id],
        evidence: comp.evidence,
      });
    }

    if (!comp.hasTests) {
      archModel.quality.untested.push(comp.id);
    }
  }

  archModel.quality.metrics = {
    averageLocPerComponent: Math.round(totalLoc / totalComps),
    maxFanInComponent: maxFanInComp?.name,
    maxFanOutComponent: maxFanOutComp?.name,
    testCoverageRatio: Math.round((testedCount / totalComps) * 100) / 100,
  };

  archModel.workspace.stats.riskCount = archModel.quality.risks.length;
}
