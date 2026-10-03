import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderInventorySection(archModel: ArchModel): string {
  const rows = archModel.projects.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td><span class="tag tag-orange">${escapeHtml(p.type)}</span></td>
      <td>${escapeHtml(p.languages.join(', ') || 'N/A')}</td>
      <td>${escapeHtml(p.frameworks.join(', ') || 'N/A')}</td>
      <td>${p.loc.toLocaleString()}</td>
      <td>${p.fileCount}</td>
      <td><code>${escapeHtml(p.rootPath)}</code></td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="inventory">
      <summary><div class="section-label">2. Workspace Inventory</div></summary>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Type</th>
              <th>Languages</th>
              <th>Frameworks</th>
              <th>LOC</th>
              <th>Files</th>
              <th>Root Path</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7">No projects detected.</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
