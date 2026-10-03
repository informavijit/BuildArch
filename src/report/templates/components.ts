import { ArchComponent, ArchWorkflow, ArchDataStore } from '../../model/archModel.js';
import { escapeHtml, escapeAttr } from '../../util/escape.js';
import { redactString } from '../../util/redact.js';

export function renderHeader(title: string, workspaceName: string, mode: string, summary: string): string {
  return `
    <div class="header">
      <div class="header-badge">🏛️ ${escapeHtml(workspaceName)} • Architecture &amp; Design Report • ${escapeHtml(mode)}</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="header-sub">${escapeHtml(redactString(summary))}</div>
    </div>
  `;
}

export function renderSectionLabel(title: string): string {
  return `<div class="section-label">${escapeHtml(title)}</div>`;
}

export function renderCard(comp: ArchComponent, colorClass: 'orange' | 'purple' | 'green' | 'blue' | 'red' | 'yellow' = 'blue', icon = '⚙️'): string {
  const fileSnippet = comp.paths[0] ? `${comp.paths[0]}${comp.evidence[0]?.line ? ' : L' + comp.evidence[0].line : ''}` : '';
  const keyBadge = comp.isKey ? '<span style="font-size:10px;background:rgba(255,107,53,0.25);color:var(--orange);padding:2px 7px;border-radius:6px;margin-left:4px">Key Component</span>' : '';
  const aiBadge = comp.confidence === 'AI-generated' ? '<span class="badge-ai">AI</span>' : `<span class="badge-conf">${comp.confidence}</span>`;

  // Build rich human-readable description if description is generic
  let desc = comp.description;
  if (!desc || desc.startsWith('Responsibility:')) {
    const symbolInfo = comp.publicSymbols.length > 0 ? ` Exports: ${comp.publicSymbols.slice(0, 3).join(', ')}.` : '';
    desc = `${comp.name} provides ${comp.type} capabilities within the ${comp.layer} layer.${symbolInfo} Total LOC: ${comp.loc.toLocaleString()}, Fan-In: ${comp.fanIn}, Fan-Out: ${comp.fanOut}.`;
  }

  const symbolsList = comp.publicSymbols.length > 0 ? `
    <div class="state-grid" style="margin-top:10px;">
      ${comp.publicSymbols.slice(0, 4).map(s => `
        <div class="state-item">
          <div class="state-name">${escapeHtml(s)}</div>
          <div class="state-desc">Exported symbol in ${escapeHtml(comp.name)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <div class="card ${colorClass}" data-search="${escapeAttr(comp.name + ' ' + comp.type + ' ' + (comp.paths.join(' ') || ''))}">
      <span class="card-icon">${icon}</span>
      <div class="card-title">${escapeHtml(comp.name)} ${keyBadge} ${aiBadge}</div>
      <div class="card-desc">${escapeHtml(redactString(desc))}</div>
      ${symbolsList}
      ${fileSnippet ? `<div class="card-file">${escapeHtml(fileSnippet)}</div>` : ''}
      <div class="tags">
        <span class="tag tag-${colorClass}">${escapeHtml(comp.type)}</span>
        ${comp.language ? `<span class="tag tag-purple">${escapeHtml(comp.language)}</span>` : ''}
        <span class="tag tag-blue">${escapeHtml(comp.layer)}</span>
      </div>
    </div>
  `;
}

export function renderHubCard(title: string, desc: string, pills: string[], items?: { name: string; desc: string }[], icon = '⚡'): string {
  const pillElements = pills.map(p => `<span class="hub-pill" style="background:rgba(139,92,246,0.2);color:var(--purple)">${escapeHtml(p)}</span>`).join('\n');
  const subItems = items && items.length > 0 ? `
    <div class="state-grid">
      ${items.map(it => `
        <div class="state-item">
          <div class="state-name">${escapeHtml(it.name)}</div>
          <div class="state-desc">${escapeHtml(it.desc)}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <div class="hub">
      <div class="hub-icon">${icon}</div>
      <div class="hub-content">
        <div class="hub-title">${escapeHtml(title)}</div>
        <div class="hub-desc">${escapeHtml(redactString(desc))}</div>
        ${subItems}
        <div class="hub-meta">${pillElements}</div>
      </div>
    </div>
  `;
}

export function renderExtCard(title: string, desc: string, badgeText: string, badgeType: 'local' | 'device' | 'free' = 'local', icon = '🗄️'): string {
  return `
    <div class="ext-card">
      <div class="ext-icon">${icon}</div>
      <div>
        <div class="ext-title">${escapeHtml(title)}</div>
        <div class="ext-desc">${escapeHtml(redactString(desc))}</div>
        <span class="ext-badge badge-${badgeType}">${escapeHtml(badgeText)}</span>
      </div>
    </div>
  `;
}

export function renderArrowRow(label: string): string {
  return `
    <div class="arrow-row">
      <div class="arrow-down">
        <svg width="16" height="24" viewBox="0 0 16 24"><path d="M8 0v20M2 14l6 8 6-8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        <span>${escapeHtml(label)}</span>
      </div>
    </div>
  `;
}

export function renderWorkflowFlow(wf: ArchWorkflow): string {
  const colors = ['b-orange', 'b-blue', 'b-purple', 'b-green', 'b-yellow', 'b-red'];

  const stepElements = wf.steps.map((step, idx) => {
    const bubbleColor = colors[idx % colors.length];
    const arrow = idx < wf.steps.length - 1 ? '<div class="flow-arrow">→</div>' : '';
    return `
      <div class="flow-step">
        <div class="flow-bubble ${bubbleColor}">${step.stepNumber}</div>
        <div class="flow-step-title">Step ${step.stepNumber}</div>
        <div class="flow-step-sub">${escapeHtml(step.action)}</div>
      </div>
      ${arrow}
    `;
  }).join('\n');

  return `
    <div style="margin-bottom: 24px;">
      <h4 style="font-size:14px; font-weight:700; margin-bottom: 10px; color: #FFFFFF;">${escapeHtml(wf.name)} <span class="badge-conf">${wf.confidence}</span></h4>
      <div class="card-desc" style="margin-bottom: 12px; font-size:13px; color:var(--muted);">${escapeHtml(redactString(wf.narrative || `Trigger: ${wf.trigger}`))}</div>
      <div class="flow-diagram">
        <div class="flow-steps">
          ${stepElements}
        </div>
      </div>
    </div>
  `;
}

export function renderLegend(usedColors: { color: string; label: string }[]): string {
  const items = usedColors.map(c => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${c.color}"></div>${escapeHtml(c.label)}
    </div>
  `).join('\n');

  return `
    <div class="legend">
      ${items}
    </div>
  `;
}

export function renderFooter(workspaceName: string, version: string, date: string, projectCount: number, componentCount: number): string {
  return `
    <div class="footer">
      ${escapeHtml(workspaceName.toUpperCase())} • Architecture &amp; Design Report<br>
      Generated by BuildArch v${escapeHtml(version)} on ${escapeHtml(date)} • ${projectCount} project(s) • ${componentCount} component(s)
    </div>
  `;
}
