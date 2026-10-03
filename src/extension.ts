import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AnalysisPipeline } from './pipeline/orchestrator.js';
import { estimateTokenCount } from './ai/budget.js';

let lastReportPath: string | undefined;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('BuildArch');
  outputChannel.appendLine('BuildArch extension activated.');

  // Register Main Command: BuildArch: Workspace (No-AI mode by default)
  const workspaceCmd = vscode.commands.registerCommand('buildarch.workspace', async () => {
    await runAnalysisFlow(context, false);
  });

  // Register Opt-in Command: BuildArch: Workspace AI
  const workspaceAiCmd = vscode.commands.registerCommand('buildarch.workspaceAi', async () => {
    await runAnalysisFlow(context, true);
  });

  // Register Command: BuildArch: Open Last Report
  const openLastCmd = vscode.commands.registerCommand('buildarch.openLastReport', async () => {
    if (lastReportPath && fs.existsSync(lastReportPath)) {
      openReportFile(lastReportPath);
    } else {
      vscode.window.showInformationMessage('No report generated yet. Run BuildArch: Workspace first.');
    }
  });

  context.subscriptions.push(workspaceCmd, workspaceAiCmd, openLastCmd, outputChannel);
}

export function deactivate() {}

async function runAnalysisFlow(context: vscode.ExtensionContext, isAiMode: boolean) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('BuildArch requires an open workspace folder.');
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const config = vscode.workspace.getConfiguration('buildarch');

  if (isAiMode && config.get<boolean>('ai.dryRun')) {
    // Dry run token estimate check
    const confirm = await vscode.window.showInformationMessage(
      'BuildArch: Workspace AI estimated token budget is under ~10,000 tokens. Proceed with AI enrichment?',
      'Proceed',
      'Cancel'
    );
    if (confirm !== 'Proceed') {
      outputChannel.appendLine('AI enrichment cancelled by user in dry-run mode.');
      return;
    }
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: isAiMode ? 'BuildArch: Workspace AI Analysis' : 'BuildArch: Workspace Analysis',
      cancellable: true,
    },
    async (progress, token) => {
      let isCancelled = false;
      token.onCancellationRequested(() => {
        isCancelled = true;
        outputChannel.appendLine('Analysis cancellation requested.');
      });

      const pipeline = new AnalysisPipeline();

      try {
        const result = await pipeline.run({
          workspacePath: rootPath,
          workspaceName: workspaceFolders[0].name,
          isAiMode,
          maxFiles: config.get<number>('maxFiles') || 20000,
          maxFileSizeKB: config.get<number>('maxFileSizeKB') || 512,
          customExcludes: config.get<string[]>('exclude') || [],
          fallbackEncoding: config.get<string>('encoding.fallback') || 'windows-1252',
          redactSecrets: config.get<boolean>('report.redactSecrets') !== false,
          onProgress: (phase, percent) => {
            progress.report({ message: `${phase} (${percent}%)`, increment: percent });
            outputChannel.appendLine(`[${percent}%] ${phase}`);
          },
          cancellationRequested: () => isCancelled,
        });

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const defaultName = `${workspaceFolders[0].name}-architecture-${dateStr}.html`;

        const saveUri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(path.join(rootPath, defaultName)),
          filters: { 'HTML Report': ['html'] },
        });

        if (saveUri) {
          const reportPath = saveUri.fsPath;
          fs.writeFileSync(reportPath, result.htmlReport, 'utf-8');
          lastReportPath = reportPath;

          if (config.get<boolean>('report.saveArchModel') !== false) {
            const jsonPath = reportPath.replace(/\.html$/i, '.archmodel.json');
            fs.writeFileSync(jsonPath, JSON.stringify(result.archModel, null, 2), 'utf-8');
          }

          outputChannel.appendLine(`Report saved to: ${reportPath}`);

          const choice = await vscode.window.showInformationMessage(
            `Architecture report saved!`,
            'Open in Browser',
            'Open in VS Code Webview'
          );

          if (choice === 'Open in Browser') {
            vscode.env.openExternal(vscode.Uri.file(reportPath));
          } else if (choice === 'Open in VS Code Webview') {
            showWebviewReport(context, reportPath, result.htmlReport);
          }
        }
      } catch (err: any) {
        outputChannel.appendLine(`Error: ${err?.message || err}`);
        vscode.window.showErrorMessage(`BuildArch Analysis Error: ${err?.message || err}`);
      }
    }
  );
}

function openReportFile(filePath: string) {
  vscode.env.openExternal(vscode.Uri.file(filePath));
}

function showWebviewReport(context: vscode.ExtensionContext, filePath: string, htmlContent: string) {
  const panel = vscode.window.createWebviewPanel(
    'buildArchReport',
    `BuildArch - ${path.basename(filePath)}`,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = htmlContent;
}
