import { ArchModel } from '../model/archModel.js';

export interface AiEnrichmentResult {
  executiveSummary?: string;
  componentPurposes?: Record<string, string>; // compId -> 1-2 sentence purpose
  workflowNarratives?: Record<string, string>; // wfId -> narrative
  riskCommentary?: Record<string, string>; // riskId -> commentary
  tokensUsed: number;
}

export interface AiProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  enrich(archModel: ArchModel, maxTokens: number): Promise<AiEnrichmentResult>;
}
