import { FileFacts } from './regex-engine.js';

export type AdapterTier = 'Tier1-AST' | 'Tier2-Regex' | 'Tier3-Inventory';

export interface LanguageAdapter {
  id: string;
  name: string;
  extensions: string[];
  manifests: string[];
  tier: AdapterTier;
  extract(filePath: string, rawText: string): FileFacts;
}
