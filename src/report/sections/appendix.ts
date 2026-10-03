import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderAppendixSection(archModel: ArchModel): string {
  const ignoredRows = archModel.unsupportedFiles.filter(f => !f.analyzed).map(f => `
    <tr>
      <td><code>${escapeHtml(f.extension)}</code></td>
      <td>${f.count}</td>
      <td>Detected but not analyzed in Tier 1/2</td>
    </tr>
  `).join('\n');

  return `
    <details class="section" open id="appendix">
      <summary><div class="section-label">14. Appendix</div></summary>
      
      <div class="card dark3" style="margin-bottom: 20px;">
        <div class="card-title">Generation Metadata</div>
        <div class="card-desc">
          <p><strong>Tool Version:</strong> BuildArch v${escapeHtml(archModel.workspace.toolVersion)}</p>
          <p><strong>Generated At:</strong> ${escapeHtml(archModel.workspace.generatedAt)}</p>
          <p><strong>Mode:</strong> ${escapeHtml(archModel.workspace.mode)}</p>
        </div>
      </div>

      <h4 style="font-size:12px; color:var(--muted); margin-bottom: 10px;">DETECTED BUT UNANALYZED FILE TYPES</h4>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Extension</th>
              <th>Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${ignoredRows || '<tr><td colspan="3">All detected file types analyzed cleanly.</td></tr>'}
          </tbody>
        </table>
      </div>
    </details>
  `;
}
