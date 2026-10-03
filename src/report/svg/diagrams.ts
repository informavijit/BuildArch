import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderArchitectureSvg(archModel: ArchModel): string {
  const width = 1100;
  const height = 400;

  const layers = ['presentation', 'application', 'domain', 'data', 'infrastructure'];
  const layerColors: Record<string, string> = {
    presentation: '#FF6B35',
    application: '#8B5CF6',
    domain: '#3B82F6',
    data: '#10B981',
    infrastructure: '#FFD23F',
  };

  let layerY = 40;
  const rects: string[] = [];

  for (const layer of layers) {
    const comps = archModel.components.filter(c => c.layer === layer).slice(0, 6);
    const color = layerColors[layer] || '#8B5CF6';

    rects.push(`<text x="20" y="${layerY + 20}" fill="${color}" font-family="Sora" font-size="12" font-weight="700" text-transform="uppercase">${escapeHtml(layer.toUpperCase())}</text>`);

    let itemX = 180;
    for (const comp of comps) {
      rects.push(`
        <g transform="translate(${itemX}, ${layerY})">
          <rect width="130" height="36" rx="8" fill="#171728" stroke="${color}" stroke-width="1.5" />
          <text x="12" y="22" fill="#ECECF5" font-family="Sora" font-size="11" font-weight="600">${escapeHtml(comp.name.slice(0, 14))}</text>
        </g>
      `);
      itemX += 145;
    }

    layerY += 65;
  }

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0F0F1A" rx="12" />
      ${rects.join('\n')}
    </svg>
  `;
}

export function renderDependencyMatrixSvg(archModel: ArchModel): string {
  const comps = archModel.components.slice(0, 10);
  const size = comps.length;
  if (size === 0) return '<div class="card-desc">No components to display in matrix.</div>';

  const cellSize = 32;
  const width = size * cellSize + 150;
  const height = size * cellSize + 150;

  const cells: string[] = [];

  for (let r = 0; r < size; r++) {
    const fromComp = comps[r];
    cells.push(`<text x="130" y="${140 + r * cellSize + 20}" fill="#ECECF5" font-family="JetBrains Mono" font-size="10" text-anchor="end">${escapeHtml(fromComp.name.slice(0, 15))}</text>`);

    for (let c = 0; c < size; c++) {
      const toComp = comps[c];
      const hasRel = archModel.relationships.some(rel => rel.fromId === fromComp.id && rel.toId === toComp.id);
      const fillColor = r === c ? '#22223A' : (hasRel ? '#FF6B35' : '#171728');
      const opacity = hasRel ? '0.8' : '0.4';

      cells.push(`
        <rect x="${140 + c * cellSize}" y="${140 + r * cellSize}" width="${cellSize - 2}" height="${cellSize - 2}" rx="4" fill="${fillColor}" fill-opacity="${opacity}" stroke="rgba(255,255,255,0.05)" />
      `);
    }
  }

  for (let c = 0; c < size; c++) {
    const toComp = comps[c];
    cells.push(`
      <text x="${140 + c * cellSize + 16}" y="125" fill="#9090AE" font-family="JetBrains Mono" font-size="10" transform="rotate(-45 ${140 + c * cellSize + 16} 125)">${escapeHtml(toComp.name.slice(0, 12))}</text>
    `);
  }

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0F0F1A" rx="12" />
      ${cells.join('\n')}
    </svg>
  `;
}
