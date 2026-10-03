import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderDeploymentSection(archModel: ArchModel): string {
  const artifactRows = archModel.deployment.artifacts.map(a => `
    <tr>
      <td><strong>${escapeHtml(a.name)}</strong></td>
      <td><span class="tag tag-yellow">${escapeHtml(a.type)}</span></td>
      <td><code>${escapeHtml(a.path)}</code></td>
      <td>${escapeHtml(a.details)}</td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="deployment">
      <summary><div class="section-label">10. Deployment and Infrastructure</div></summary>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Artifact</th>
              <th>Type</th>
              <th>Path</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${artifactRows || '<tr><td colspan="4">No Docker / K8s / IaC infrastructure files detected.</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
