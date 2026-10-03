import { ArchModel } from '../model/archModel.js';
import { FileEntry } from '../util/fs.js';

export interface AnalysisContext {
  workspacePath: string;
  workspaceName: string;
  files: FileEntry[];
  archModel: ArchModel;
  fileTextCache: Map<string, string>;
  options: {
    fallbackEncoding: string;
    redactSecrets: boolean;
  };
}

export interface Analyzer {
  id: string;
  name: string;
  detect(ctx: AnalysisContext): boolean;
  analyze(ctx: AnalysisContext): void;
}
