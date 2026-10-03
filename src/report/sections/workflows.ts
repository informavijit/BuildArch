import { ArchModel } from '../../model/archModel.js';
import { renderWorkflowFlow } from '../templates/components.js';

export function renderWorkflowsSection(archModel: ArchModel): string {
  const flows = archModel.workflows.map(wf => renderWorkflowFlow(wf)).join('\n');

  return `
    <details class="section" open id="workflows">
      <summary><div class="section-label">9. Major Workflows</div></summary>
      ${flows || '<div class="card-desc">No end-to-end workflows detected.</div>'}
    </details>
  `;
}
