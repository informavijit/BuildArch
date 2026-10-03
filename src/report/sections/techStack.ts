import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderTechStackSection(archModel: ArchModel): string {
  const langChips = archModel.unsupportedFiles.map(f => `
    <span class="tag ${f.analyzed ? 'tag-orange' : 'tag-yellow'}" style="padding: 4px 10px; font-size: 11px;">
      ${escapeHtml(f.extension)} (${f.count} files, ${f.loc.toLocaleString()} LOC)
    </span>
  `).join('\n');

  return `
    <details class="section" open id="tech-stack">
      <summary><div class="section-label">13. Technology and Dependency Inventory</div></summary>
      <div style="margin-bottom: 16px;">
        <h4 style="font-size:12px; color:var(--muted); margin-bottom: 8px;">DETECTED FILE TYPES &amp; EXTENSIONS MATRIX</h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${langChips}
        </div>
      </div>
    </details>
  `;
}
