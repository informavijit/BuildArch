import { ArchModel } from '../model/archModel.js';
import { DESIGN_SYSTEM_CSS } from './templates/designSystemCss.js';
import { EXTENSION_CSS } from './templates/extensionCss.js';
import { renderHeader, renderLegend, renderFooter } from './templates/components.js';
import { renderOverviewSection } from './sections/overview.js';
import { renderInventorySection } from './sections/inventory.js';
import { renderArchitectureSection } from './sections/architecture.js';
import { renderKeyComponentsSection } from './sections/keyComponents.js';
import { renderAllComponentsSection } from './sections/allComponents.js';
import { renderRelationshipsSection } from './sections/relationships.js';
import { renderInterfacesSection } from './sections/interfaces.js';
import { renderDataArchitectureSection } from './sections/dataArchitecture.js';
import { renderWorkflowsSection } from './sections/workflows.js';
import { renderDeploymentSection } from './sections/deployment.js';
import { renderCrossCuttingSection } from './sections/crossCutting.js';
import { renderQualitySection } from './sections/quality.js';
import { renderTechStackSection } from './sections/techStack.js';
import { renderAppendixSection } from './sections/appendix.js';

export function generateHtmlReport(archModel: ArchModel): string {
  const legendColors = [
    { color: 'var(--orange)', label: 'User Interface / Clients' },
    { color: 'var(--purple)', label: 'API Gateway / Orchestration (Hub)' },
    { color: 'var(--blue)', label: 'Domain Services & Controllers' },
    { color: 'var(--green)', label: 'Data Access & Persistence' },
    { color: 'var(--yellow)', label: 'Infrastructure & Scripts' },
    { color: 'var(--red)', label: 'Architecture Risks & Hotspots' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${archModel.workspace.name} - Architecture &amp; Design Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
${DESIGN_SYSTEM_CSS}

${EXTENSION_CSS}
  </style>
</head>
<body>
  <div class="page">
    <nav class="toc">
      <a href="#overview">1. Overview</a>
      <a href="#inventory">2. Inventory</a>
      <a href="#architecture">3. Architecture</a>
      <a href="#key-components">4. Key Components</a>
      <a href="#all-components">5. All Components</a>
      <a href="#relationships">6. Dependencies</a>
      <a href="#interfaces">7. APIs</a>
      <a href="#data-architecture">8. Data</a>
      <a href="#workflows">9. Workflows</a>
      <a href="#deployment">10. Deployment</a>
      <a href="#cross-cutting">11. Cross-Cutting</a>
      <a href="#quality">12. Quality &amp; Risks</a>
      <a href="#tech-stack">13. Tech Stack</a>
      <a href="#appendix">14. Appendix</a>
      <button onclick="toggleTheme()" style="margin-left:auto; background:var(--dark3); border:1px solid var(--border); color:var(--text); padding:4px 10px; border-radius:999px; cursor:pointer; font-size:11px;">🌓 Theme</button>
    </nav>

    ${renderHeader('Workspace Architecture Report', archModel.workspace.name, archModel.workspace.mode, `Comprehensive report for ${archModel.workspace.name} with ${archModel.projects.length} project(s) and ${archModel.components.length} component(s).`)}

    ${renderOverviewSection(archModel)}
    ${renderInventorySection(archModel)}
    ${renderArchitectureSection(archModel)}
    ${renderKeyComponentsSection(archModel)}
    ${renderAllComponentsSection(archModel)}
    ${renderRelationshipsSection(archModel)}
    ${renderInterfacesSection(archModel)}
    ${renderDataArchitectureSection(archModel)}
    ${renderWorkflowsSection(archModel)}
    ${renderDeploymentSection(archModel)}
    ${renderCrossCuttingSection(archModel)}
    ${renderQualitySection(archModel)}
    ${renderTechStackSection(archModel)}
    ${renderAppendixSection(archModel)}

    ${renderLegend(legendColors)}
    ${renderFooter(archModel.workspace.name, archModel.workspace.toolVersion, archModel.workspace.generatedAt, archModel.projects.length, archModel.components.length)}
  </div>

  <script>
    function filterComponents() {
      const q = document.getElementById('compSearch').value.toLowerCase();
      const cards = document.querySelectorAll('#compContainer .card');
      cards.forEach(card => {
        const text = card.getAttribute('data-search') || '';
        card.style.display = text.toLowerCase().includes(q) ? '' : 'none';
      });
    }

    function toggleTheme() {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme');
      root.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
    }
  </script>
</body>
</html>`;
}
