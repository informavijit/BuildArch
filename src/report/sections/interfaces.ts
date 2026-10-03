import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderInterfacesSection(archModel: ArchModel): string {
  const rows = archModel.interfaces.map(i => `
    <tr>
      <td><span class="tag tag-blue">${escapeHtml(i.method || 'GET')}</span></td>
      <td><code>${escapeHtml(i.path)}</code></td>
      <td><span class="tag tag-purple">${escapeHtml(i.kind)}</span></td>
      <td>${escapeHtml(i.handler)}</td>
      <td><code>${escapeHtml(i.file)}${i.line ? ':' + i.line : ''}</code></td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="interfaces">
      <summary><div class="section-label">7. Interfaces and APIs</div></summary>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path / Endpoint</th>
              <th>Kind</th>
              <th>Handler</th>
              <th>Evidence File</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5">No exposed endpoints or interfaces detected.</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
