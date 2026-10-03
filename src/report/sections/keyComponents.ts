import { ArchModel } from '../../model/archModel.js';
import { renderCard } from '../templates/components.js';

export function renderKeyComponentsSection(archModel: ArchModel): string {
  const keyComps = archModel.components.filter(c => c.isKey).slice(0, 8);
  const displayComps = keyComps.length > 0 ? keyComps : archModel.components.slice(0, 6);

  const cards = displayComps.map(c => {
    const color = c.layer === 'presentation' ? 'orange' : (c.layer === 'data' ? 'green' : 'purple');
    return renderCard(c, color, '⭐');
  }).join('\n');

  return `
    <details class="section" open id="key-components">
      <summary><div class="section-label">4. Key Components</div></summary>
      <div class="arch-row row-3">
        ${cards}
      </div>
    </details>
  `;
}
