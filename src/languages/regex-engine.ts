import { CommentStyle, detectCommentStyle, stripCommentsAndStrings } from './comment-stripper.js';

export type RuleKind = 'import' | 'declaration' | 'entry' | 'route' | 'data' | 'external' | 'config';

export interface RuleDefinition {
  id: string;
  kind: RuleKind;
  pattern: string;
  flags?: string;
  captureGroups?: {
    name?: number;
    type?: number;
    path?: number;
    method?: number;
    detail?: number;
  };
  confidence?: 'Extracted' | 'Inferred';
  description?: string;
}

export interface RulePack {
  language: string;
  extensions: string[];
  rules: RuleDefinition[];
}

export interface ExtractedFact {
  ruleId: string;
  kind: RuleKind;
  name: string;
  type?: string;
  detail?: string;
  file: string;
  line: number;
  snippet?: string;
  confidence: 'Extracted' | 'Inferred';
}

export interface FileFacts {
  file: string;
  language: string;
  imports: ExtractedFact[];
  declarations: ExtractedFact[];
  entryPoints: ExtractedFact[];
  routes: ExtractedFact[];
  dataAccess: ExtractedFact[];
  externalCalls: ExtractedFact[];
  configKeys: ExtractedFact[];
  loc: number;
  commentLoc: number;
}

/**
 * Universal Regex Rule-Pack Engine.
 * Runs declarative rules against stripped source code safely with a timeout guard per file.
 */
export class RegexRuleEngine {
  private rulePacks: Map<string, RulePack> = new Map();

  public registerRulePack(rawPack: RulePack): void {
    const pack = (rawPack as any).default || rawPack;
    if (pack && pack.language) {
      this.rulePacks.set(pack.language.toLowerCase(), pack);
      if (Array.isArray(pack.extensions)) {
        for (const ext of pack.extensions) {
          this.rulePacks.set(ext.toLowerCase(), pack);
        }
      }
    }
  }

  public getRulePack(extOrLang: string): RulePack | undefined {
    return this.rulePacks.get(extOrLang.toLowerCase());
  }

  public analyze(
    filePath: string,
    rawText: string,
    extOrLang: string,
    timeoutMs = 1000
  ): FileFacts {
    const ext = filePath.includes('.') ? '.' + filePath.split('.').pop()! : extOrLang;
    const pack = this.getRulePack(ext) || this.getRulePack(extOrLang) || this.getRulePack('generic');

    const commentStyle: CommentStyle = detectCommentStyle(ext);
    const { strippedLines, originalLines } = stripCommentsAndStrings(rawText, commentStyle);

    const facts: FileFacts = {
      file: filePath,
      language: pack?.language || extOrLang || 'unknown',
      imports: [],
      declarations: [],
      entryPoints: [],
      routes: [],
      dataAccess: [],
      externalCalls: [],
      configKeys: [],
      loc: originalLines.filter(l => l.trim().length > 0).length,
      commentLoc: originalLines.length - strippedLines.filter(l => l.trim().length > 0).length,
    };

    if (!pack || pack.rules.length === 0) {
      return facts;
    }

    const startTime = Date.now();

    for (const rule of pack.rules) {
      if (Date.now() - startTime > timeoutMs) {
        break; // Timeout guard
      }

      let regex: RegExp;
      try {
        regex = new RegExp(rule.pattern, rule.flags || 'm');
      } catch {
        continue;
      }

      const cg = rule.captureGroups || { name: 1 };
      const globalRegex = new RegExp(rule.pattern, (rule.flags || '') + (rule.flags?.includes('g') ? '' : 'g'));

      for (let lineIdx = 0; lineIdx < strippedLines.length; lineIdx++) {
        if (Date.now() - startTime > timeoutMs) break;

        const line = strippedLines[lineIdx];
        if (!line.trim()) continue;

        let match: RegExpExecArray | null;
        globalRegex.lastIndex = 0;

        while ((match = globalRegex.exec(line)) !== null) {
          const extractedName = (cg.name !== undefined && match[cg.name]) ? match[cg.name].trim() : (match[0] || '').trim();
          const extractedType = (cg.type !== undefined && match[cg.type]) ? match[cg.type].trim() : undefined;
          const extractedDetail = (cg.detail !== undefined && match[cg.detail]) ? match[cg.detail].trim() : undefined;
          const extractedMethod = (cg.method !== undefined && match[cg.method]) ? match[cg.method].trim() : undefined;
          const extractedPath = (cg.path !== undefined && match[cg.path]) ? match[cg.path].trim() : undefined;

          if (!extractedName && !extractedPath) break;

          const fact: ExtractedFact = {
            ruleId: rule.id,
            kind: rule.kind,
            name: extractedName || extractedPath || '',
            type: extractedType,
            detail: extractedDetail || (extractedMethod ? `${extractedMethod} ${extractedPath || ''}` : undefined),
            file: filePath,
            line: lineIdx + 1,
            snippet: originalLines[lineIdx]?.trim().slice(0, 100),
            confidence: rule.confidence || 'Extracted',
          };

          switch (rule.kind) {
            case 'import':
              facts.imports.push(fact);
              break;
            case 'declaration':
              facts.declarations.push(fact);
              break;
            case 'entry':
              facts.entryPoints.push(fact);
              break;
            case 'route':
              facts.routes.push(fact);
              break;
            case 'data':
              facts.dataAccess.push(fact);
              break;
            case 'external':
              facts.externalCalls.push(fact);
              break;
            case 'config':
              facts.configKeys.push(fact);
              break;
          }

          if (!globalRegex.global) break;
        }
      }
    }

    return facts;
  }
}
