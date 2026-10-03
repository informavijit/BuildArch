import { ArchModel } from '../../model/archModel.js';
import { renderCard, renderHubCard, renderArrowRow, renderExtCard } from '../templates/components.js';
import { renderArchitectureSvg } from '../svg/diagrams.js';

export function renderArchitectureSection(archModel: ArchModel): string {
  const presComps = archModel.components.filter(c => c.layer === 'presentation').slice(0, 3);
  const appComps = archModel.components.filter(c => c.layer === 'application').slice(0, 3);
  const domComps = archModel.components.filter(c => c.layer === 'domain').slice(0, 3);
  const dataComps = archModel.components.filter(c => c.layer === 'data').slice(0, 3);

  const hubComp = archModel.components.find(c => c.isKey && (c.layer === 'application' || c.layer === 'domain')) || archModel.components[0];

  const presCards = presComps.map(c => renderCard(c, 'orange', '📱')).join('\n');
  const appCards = appComps.map(c => renderCard(c, 'purple', '⚙️')).join('\n');
  const domCards = domComps.map(c => renderCard(c, 'blue', '🧠')).join('\n');
  const dataCards = dataComps.map(c => renderCard(c, 'green', '🗄️')).join('\n');

  const hubSubItems = archModel.interfaces.slice(0, 4).map(i => ({
    name: `${i.method || 'API'} ${i.path}`,
    desc: `Handler: ${i.handler} (${i.file})`,
  }));

  const extCards = archModel.dataStores.slice(0, 3).map(d =>
    renderExtCard(d.name, `Technology: ${d.technology}. ${d.models.length > 0 ? 'Models: ' + d.models.join(', ') : 'Data store module.'}`, d.kind.toUpperCase(), 'local', '🗄️')
  ).join('\n');

  return `
    <details class="section" open id="architecture">
      <summary><div class="section-label">3. System Architecture (Layered View)</div></summary>
      
      <div class="diagram">
        ${renderArchitectureSvg(archModel)}
      </div>

      <div class="arch-wrapper">
        <div class="arch-row row-3">
          ${presCards || '<div class="card orange"><span class="card-icon">📱</span><div class="card-title">User Interface / Presentation Layer</div><div class="card-desc">UI Screens, ViewControllers, Web Frontends, &amp; Flutter Widgets.</div></div>'}
        </div>

        ${renderArrowRow('HTTPS / REST / RPC Requests &amp; UI Events')}

        ${hubComp ? renderHubCard(
          hubComp.name,
          hubComp.description || `Central Orchestration Hub for ${archModel.workspace.name}. Coordinates domain logic, application state, and external interfaces.`,
          archModel.interfaces.slice(0, 4).map(i => `${i.method || 'GET'} ${i.path}`),
          hubSubItems,
          '⚡'
        ) : ''}

        ${renderArrowRow('Domain Logic Processing &amp; Service Orchestration')}

        <div class="arch-row row-3">
          ${appCards || domCards || '<div class="card blue"><span class="card-icon">🧠</span><div class="card-title">Domain Business Services</div><div class="card-desc">Business rules, domain models, services, and algorithm execution.</div></div>'}
        </div>

        ${renderArrowRow('SQL / ORM / Data Persistence &amp; Integrations')}

        <div class="arch-row row-3">
          ${extCards || dataCards || '<div class="card green"><span class="card-icon">🗄️</span><div class="card-title">Data Access &amp; Persistence</div><div class="card-desc">Relational databases, ORM entities, local stores, and API clients.</div></div>'}
        </div>
      </div>
    </details>
  `;
}
