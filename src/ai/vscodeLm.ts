import { AiProvider, AiEnrichmentResult } from './provider.js';
import { ArchModel } from '../model/archModel.js';
import { getCompactFactsJson, getCachedEnrichment, setCachedEnrichment } from './budget.js';
import { buildEnrichmentPrompt, SYSTEM_PROMPT } from './prompts.js';

function getVscodeModule(): any {
  try {
    return require('vscode');
  } catch {
    return undefined;
  }
}

export class VsCodeLmProvider implements AiProvider {
  public id = 'vscode-lm';
  public name = 'VS Code Language Model API';

  public async isAvailable(): Promise<boolean> {
    try {
      const vscode = getVscodeModule();
      if (vscode && vscode.lm && vscode.lm.selectChatModels) {
        const models = await vscode.lm.selectChatModels();
        return models.length > 0;
      }
    } catch {
      // Ignore
    }
    return false;
  }

  public async enrich(archModel: ArchModel, _maxTokens: number): Promise<AiEnrichmentResult> {
    const cached = getCachedEnrichment(archModel);
    if (cached) {
      return cached;
    }

    const factsJson = getCompactFactsJson(archModel);
    const prompt = buildEnrichmentPrompt(factsJson);

    try {
      const vscode = getVscodeModule();
      if (vscode && vscode.lm && vscode.lm.selectChatModels) {
        const models = await vscode.lm.selectChatModels();
        if (models.length > 0) {
          const model = models[0];
          const messages = [
            vscode.LanguageModelChatMessage.User(SYSTEM_PROMPT + '\n' + prompt)
          ];
          const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
          let rawText = '';
          for await (const fragment of response.text) {
            rawText += fragment;
          }

          const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
          const result: AiEnrichmentResult = {
            executiveSummary: parsed.executiveSummary,
            componentPurposes: parsed.componentPurposes,
            workflowNarratives: parsed.workflowNarratives,
            riskCommentary: parsed.riskCommentary,
            tokensUsed: Math.ceil(rawText.length / 4),
          };

          setCachedEnrichment(archModel, result);
          return result;
        }
      }
    } catch {
      // Fallback
    }

    // Default mock enrichment for offline/test environments
    const result: AiEnrichmentResult = {
      executiveSummary: `System '${archModel.workspace.name}' contains ${archModel.projects.length} project(s) with ${archModel.components.length} component(s) across key architectural layers.`,
      componentPurposes: Object.fromEntries(archModel.components.map(c => [c.id, `Provides ${c.type} capability for ${c.name} in layer ${c.layer}.`])),
      workflowNarratives: Object.fromEntries(archModel.workflows.map(w => [w.id, `Workflow '${w.name}' triggered by ${w.trigger}, executing through ${w.steps.length} ordered component steps.`])),
      riskCommentary: Object.fromEntries(archModel.quality.risks.map(r => [r.id, `Review ${r.category} finding in '${r.title}' and apply modular refactoring.`])),
      tokensUsed: 150,
    };

    setCachedEnrichment(archModel, result);
    return result;
  }
}
