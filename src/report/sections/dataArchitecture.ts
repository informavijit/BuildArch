import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';
import { renderExtCard } from '../templates/components.js';

export function renderDataArchitectureSection(archModel: ArchModel): string {
  const extCards = archModel.dataStores.map(d =>
    renderExtCard(
      d.name,
      `Technology: ${d.technology}. ${d.models.length > 0 ? 'Entities/Models: ' + d.models.join(', ') : 'Persistence storage unit.'} Evidence file: ${d.evidence[0]?.file || 'N/A'}`,
      d.kind.toUpperCase(),
      d.kind === 'local-storage' || d.kind === 'embedded' ? 'local' : 'free',
      '🗄️'
    )
  ).join('\n');

  const rows = archModel.dataStores.map(d => `
    <tr>
      <td><strong>${escapeHtml(d.name)}</strong></td>
      <td><span class="tag tag-green">${escapeHtml(d.kind)}</span></td>
      <td>${escapeHtml(d.technology)}</td>
      <td>${escapeHtml(d.models.join(', ') || 'N/A')}</td>
      <td><code>${escapeHtml(d.evidence[0]?.file || 'N/A')}</code></td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="data-architecture">
      <summary><div class="section-label">8. Data Architecture &amp; Persistence Stores</div></summary>
      
      <div class="arch-row row-3" style="margin-bottom: 24px;">
        ${extCards || renderExtCard('Primary Database / Store', 'Relational / NoSQL database storage layer.', 'PERSISTENCE', 'local', '🗄️')}
      </div>

      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Data Store Name</th>
              <th>Kind</th>
              <th>Technology</th>
              <th>Models / Entities</th>
              <th>Evidence File</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5">No explicit data stores or ORM entities detected.</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
