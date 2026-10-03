import * as path from 'path';
import { ArchModel, createEmptyArchModel } from '../model/archModel.js';
import { scanDirectory, readFileText, FileEntry } from '../util/fs.js';
import { DiscoveryAnalyzer } from '../analyzers/discovery.js';
import { JavaAnalyzer } from '../analyzers/java.js';
import { DotNetAnalyzer } from '../analyzers/dotnet.js';
import { CppAnalyzer } from '../analyzers/cpp.js';
import { DelphiAnalyzer } from '../analyzers/delphi.js';
import { PythonAnalyzer } from '../analyzers/python.js';
import { JavaScriptTypeScriptAnalyzer } from '../analyzers/javascript-typescript.js';
import { DartAnalyzer } from '../analyzers/dart.js';
import { PowerShellAnalyzer } from '../analyzers/powershell.js';
import { PerlAnalyzer } from '../analyzers/perl.js';
import { MultiLanguageAnalyzer } from '../analyzers/go-rust-kotlin-swift-php-ruby.js';
import { ShellAnalyzer } from '../analyzers/shell.js';
import { SqlAnalyzer } from '../analyzers/sql.js';
import { DockerAnalyzer } from '../analyzers/docker.js';
import { K8sAnalyzer } from '../analyzers/k8s.js';
import { CiAnalyzer } from '../analyzers/ci.js';
import { OpenApiAnalyzer } from '../analyzers/openapi.js';
import { ProtoAnalyzer } from '../analyzers/proto.js';
import { ConfigAnalyzer } from '../analyzers/config.js';
import { GenericFallbackAnalyzer } from '../analyzers/generic-fallback.js';

import { buildDependencyGraph } from '../graph/dependencyGraph.js';
import { detectCycles } from '../graph/cycles.js';
import { calculateMetricsAndHotspots } from '../graph/metrics.js';
import { linkCrossLanguageComponents } from '../graph/crossLanguage.js';
import { traceMajorWorkflows } from '../graph/workflows.js';

import { VsCodeLmProvider } from '../ai/vscodeLm.js';
import { generateHtmlReport } from '../report/renderer.js';

export interface PipelineOptions {
  workspacePath: string;
  workspaceName?: string;
  isAiMode?: boolean;
  maxFiles?: number;
  maxFileSizeKB?: number;
  customExcludes?: string[];
  fallbackEncoding?: string;
  redactSecrets?: boolean;
  onProgress?: (phase: string, percent: number) => void;
  cancellationRequested?: () => boolean;
}

export class AnalysisPipeline {
  public async run(options: PipelineOptions): Promise<{ archModel: ArchModel; htmlReport: string }> {
    const workspaceName = options.workspaceName || path.basename(options.workspacePath);
    const mode = options.isAiMode ? 'AI-assisted' : 'No AI (rule-based)';
    const archModel = createEmptyArchModel(workspaceName, mode);

    options.onProgress?.('Discovering files...', 10);

    // 1. File Discovery
    const files: FileEntry[] = scanDirectory(
      options.workspacePath,
      options.workspacePath,
      options.maxFiles || 20000,
      options.maxFileSizeKB || 512,
      options.customExcludes || []
    );

    if (options.cancellationRequested?.()) {
      throw new Error('Analysis cancelled by user.');
    }

    // Cache file text content
    const fileTextCache = new Map<string, string>();
    for (const f of files) {
      if (options.cancellationRequested?.()) {
        throw new Error('Analysis cancelled by user.');
      }
      const decoded = readFileText(f.absolutePath, options.fallbackEncoding || 'windows-1252');
      fileTextCache.set(f.absolutePath, decoded.text);
    }

    const ctx = {
      workspacePath: options.workspacePath,
      workspaceName,
      files,
      archModel,
      fileTextCache,
      options: {
        fallbackEncoding: options.fallbackEncoding || 'windows-1252',
        redactSecrets: options.redactSecrets !== false,
      },
    };

    options.onProgress?.('Parsing code & components...', 30);

    // 2. Run Analyzers
    const analyzers = [
      new DiscoveryAnalyzer(),
      new JavaAnalyzer(),
      new DotNetAnalyzer(),
      new CppAnalyzer(),
      new DelphiAnalyzer(),
      new PythonAnalyzer(),
      new JavaScriptTypeScriptAnalyzer(),
      new DartAnalyzer(),
      new PowerShellAnalyzer(),
      new PerlAnalyzer(),
      new MultiLanguageAnalyzer(),
      new ShellAnalyzer(),
      new SqlAnalyzer(),
      new DockerAnalyzer(),
      new K8sAnalyzer(),
      new CiAnalyzer(),
      new OpenApiAnalyzer(),
      new ProtoAnalyzer(),
      new ConfigAnalyzer(),
      new GenericFallbackAnalyzer(),
    ];

    for (const analyzer of analyzers) {
      if (options.cancellationRequested?.()) {
        throw new Error('Analysis cancelled by user.');
      }
      if (analyzer.detect(ctx)) {
        try {
          analyzer.analyze(ctx);
        } catch (err) {
          // Log and continue - never crash on bad file
          console.error(`Analyzer ${analyzer.id} warning:`, err);
        }
      }
    }

    options.onProgress?.('Building dependency graph...', 60);

    // 3. Graph & Metrics
    buildDependencyGraph(archModel);
    detectCycles(archModel);
    calculateMetricsAndHotspots(archModel);
    linkCrossLanguageComponents(archModel);

    options.onProgress?.('Tracing workflows...', 80);

    // 4. Trace Workflows
    traceMajorWorkflows(archModel);

    // 5. AI Enrichment (Only for BuildArch: Workspace AI)
    if (options.isAiMode) {
      options.onProgress?.('AI Enrichment phase...', 90);
      try {
        const aiProvider = new VsCodeLmProvider();
        const enrichment = await aiProvider.enrich(archModel, 10000);

        if (enrichment.executiveSummary) {
          archModel.crossCutting.auth.push(enrichment.executiveSummary);
        }

        if (enrichment.componentPurposes) {
          for (const comp of archModel.components) {
            if (enrichment.componentPurposes[comp.id]) {
              comp.description = enrichment.componentPurposes[comp.id];
              comp.confidence = 'AI-generated';
            }
          }
        }

        if (enrichment.workflowNarratives) {
          for (const wf of archModel.workflows) {
            if (enrichment.workflowNarratives[wf.id]) {
              wf.narrative = enrichment.workflowNarratives[wf.id];
              wf.confidence = 'AI-generated';
            }
          }
        }
      } catch (err) {
        console.error('AI Enrichment step failed, continuing with rule-based facts:', err);
      }
    }

    options.onProgress?.('Rendering HTML report...', 95);

    // 6. Generate HTML Report
    const htmlReport = generateHtmlReport(archModel);

    options.onProgress?.('Completed.', 100);

    return { archModel, htmlReport };
  }
}
