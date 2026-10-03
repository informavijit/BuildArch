import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderQualitySection(archModel: ArchModel): string {
  const riskRows = archModel.quality.risks.map(r => `
    <tr>
      <td><span class="tag ${r.severity === 'high' ? 'chip-high' : (r.severity === 'medium' ? 'chip-med' : 'chip-low')}">${escapeHtml(r.severity.toUpperCase())}</span></td>
      <td><strong>${escapeHtml(r.title)}</strong></td>
      <td><span class="tag tag-purple">${escapeHtml(r.category)}</span></td>
      <td>${escapeHtml(r.description)}</td>
      <td><code>${escapeHtml(r.evidence[0]?.file || 'N/A')}</code></td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="quality">
      <summary><div class="section-label">12. Quality, Risks and Technical Debt</div></summary>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Risk Finding</th>
              <th>Category</th>
              <th>Description</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${riskRows || '<tr><td colspan="5">No technical debt or architecture risks flagged!</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
