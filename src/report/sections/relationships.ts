import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';
import { renderDependencyMatrixSvg } from '../svg/diagrams.js';

export function renderRelationshipsSection(archModel: ArchModel): string {
  const rows = archModel.relationships.map(r => `
    <tr>
      <td><code>${escapeHtml(r.fromId)}</code></td>
      <td><code>${escapeHtml(r.toId)}</code></td>
      <td><span class="tag tag-purple">${escapeHtml(r.kind)}</span></td>
      <td>${escapeHtml(r.label)}</td>
      <td><span class="badge-conf">${escapeHtml(r.confidence)}</span></td>
      <td><code>${escapeHtml(r.evidence[0]?.file || 'N/A')}${r.evidence[0]?.line ? ':' + r.evidence[0].line : ''}</code></td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="relationships">
      <summary><div class="section-label">6. Relationships and Dependencies</div></summary>
      
      <h4 style="font-size:12px; font-weight:700; color:var(--muted); margin-bottom:10px;">COMPONENT DEPENDENCY MATRIX</h4>
      <div class="diagram">
        ${renderDependencyMatrixSvg(archModel)}
      </div>

      <h4 style="font-size:12px; font-weight:700; color:var(--muted); margin: 20px 0 10px;">INTER-COMPONENT RELATIONSHIP REGISTER</h4>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Kind</th>
              <th>Label</th>
              <th>Confidence</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6">No explicit dependencies registered.</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
