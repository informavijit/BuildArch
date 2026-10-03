import { ArchModel } from '../../model/archModel.js';
import { renderCard } from '../templates/components.js';

export function renderAllComponentsSection(archModel: ArchModel): string {
  const cards = archModel.components.map(c => {
    let color: 'orange' | 'purple' | 'green' | 'blue' | 'red' | 'yellow' = 'blue';
    if (c.layer === 'presentation') color = 'orange';
    else if (c.layer === 'application') color = 'purple';
    else if (c.layer === 'data') color = 'green';
    else if (c.layer === 'infrastructure') color = 'yellow';
    return renderCard(c, color, '📦');
  }).join('\n');

  return `
    <details class="section" open id="all-components">
      <summary><div class="section-label">5. All Components Catalog</div></summary>
      <div style="margin-bottom: 16px;">
        <input type="text" class="search" id="compSearch" placeholder="🔍 Search components by name, path or tag..." onkeyup="filterComponents()" />
      </div>
      <div class="arch-row row-3" id="compContainer">
        ${cards || '<div class="card-desc">No components found.</div>'}
      </div>
    </details>
  `;
}
