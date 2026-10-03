import { ArchModel } from '../../model/archModel.js';
import { escapeHtml } from '../../util/escape.js';

export function renderCrossCuttingSection(archModel: ArchModel): string {
  const configs = archModel.crossCutting.config.map(c => `<li>${escapeHtml(c)}</li>`).join('\n');

  return `
    <details class="section" open id="cross-cutting">
      <summary><div class="section-label">11. Cross-Cutting Concerns</div></summary>
      <div class="arch-row row-2">
        <div class="card purple">
          <div class="card-title">🔐 Configuration &amp; Secret Keys (Names Only)</div>
          <div class="card-desc">
            <ul style="margin-left: 16px; line-height: 1.8;">
              ${configs || '<li>No explicit secret names flagged.</li>'}
            </ul>
          </div>
        </div>
        <div class="card blue">
          <div class="card-title">🧪 Testing &amp; Observability Strategy</div>
          <div class="card-desc">
            <p><strong>Test Coverage Ratio:</strong> ${Math.round((archModel.quality.metrics.testCoverageRatio || 0) * 100)}%</p>
            <p><strong>Untested Components:</strong> ${archModel.quality.untested.length}</p>
          </div>
        </div>
      </div>
    </details>
  `;
}
