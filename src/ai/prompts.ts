export const SYSTEM_PROMPT = `
You are BuildArch AI architecture report enricher.
Use ONLY the provided JSON facts. If unknown, say Unknown.
Do NOT invent components, endpoints, technologies, or file paths.
Output valid JSON adhering to the requested schema.
`;

export function buildEnrichmentPrompt(compactFactsJson: string): string {
  return `
Given the following architecture facts:
${compactFactsJson}

Provide JSON enrichment containing:
- "executiveSummary": concise 2-sentence executive summary of system architecture.
- "componentPurposes": map of component ID to concise 1-2 sentence purpose statement based on evidence.
- "workflowNarratives": map of workflow ID to step-by-step narrative explanation.
- "riskCommentary": map of risk ID to actionable mitigation advice.
`;
}
