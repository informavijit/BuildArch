import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';
import { redactString } from '../../util/redact.js';

export function renderOverviewSection(archModel: ArchModel): string {
  const stats = archModel.workspace.stats;
  const execSummary = archModel.crossCutting.auth.length > 0 ? archModel.crossCutting.auth.join(' ') : 'Architecture analyzed deterministically via rule-based discovery engines.';

  return `
    <details class="section" open id="overview">
      <summary><div class="section-label">1. Executive Overview</div></summary>
      <div style="margin-bottom: 24px;">
        <p class="card-desc" style="font-size: 13px; line-height: 1.8;">${escapeHtml(redactString(execSummary))}</p>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-num">${stats.projectCount}</div>
          <div class="stat-label">Projects</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.componentCount}</div>
          <div class="stat-label">Components</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.totalLoc.toLocaleString()}</div>
          <div class="stat-label">Total LOC</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.interfaceCount}</div>
          <div class="stat-label">Endpoints / APIs</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.dataStoreCount}</div>
          <div class="stat-label">Data Stores</div>
        </div>
        <div class="stat">
          <div class="stat-num">${stats.riskCount}</div>
          <div class="stat-label">Identified Risks</div>
        </div>
      </div>
    </details>
  `;
}
