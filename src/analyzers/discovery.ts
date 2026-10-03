import * as path from 'path';
import { AnalysisContext, Analyzer } from './analyzer.js';
import { ArchProject } from '../model/archModel.js';
import { readFileText } from '../util/fs.js';

export class DiscoveryAnalyzer implements Analyzer {
  public id = 'discovery';
  public name = 'Workspace & Project Discovery Analyzer';

  public detect(_ctx: AnalysisContext): boolean {
    return true; // Always runs
  }

  public analyze(ctx: AnalysisContext): void {
    const projectMap = new Map<string, ArchProject>();
    const extStats = new Map<string, { count: number; loc: number; analyzed: boolean }>();

    // 1. Group files by root directory or manifest
    const manifestFiles = ctx.files.filter(f => {
      const b = path.basename(f.relativePath).toLowerCase();
      return [
        'pubspec.yaml',
        'package.json',
        'pom.xml',
        'build.gradle',
        'build.gradle.kts',
        'pyproject.toml',
        'requirements.txt',
        'setup.py',
        'go.mod',
        'cargo.toml',
        'composer.json',
        'dockerfile',
        'docker-compose.yml',
        'docker-compose.yaml',
        'cmakelists.txt',
        'cpanfile',
        'makefile.pl',
      ].includes(b) ||
      b.endsWith('.csproj') ||
      b.endsWith('.sln') ||
      b.endsWith('.dproj') ||
      b.endsWith('.dpr') ||
      b.endsWith('.dpk') ||
      b.endsWith('.psd1') ||
      b.endsWith('.vcxproj');
    });

    if (manifestFiles.length === 0) {
      // Create root project
      projectMap.set('root', {
        id: 'project-root',
        name: ctx.workspaceName,
        type: 'unknown',
        languages: [],
        frameworks: [],
        rootPath: '.',
        entryPoints: [],
        loc: 0,
        fileCount: 0,
      });
    } else {
      for (const mf of manifestFiles) {
        const dir = path.dirname(mf.relativePath);
        const normDir = dir === '.' ? 'root' : dir.replace(/\\/g, '/');
        const projectName = dir === '.' ? ctx.workspaceName : path.basename(dir);
        const manifestName = path.basename(mf.relativePath).toLowerCase();

        let projType: ArchProject['type'] = 'unknown';
        const frameworks: string[] = [];

        if (manifestName === 'pubspec.yaml') {
          projType = 'mobile';
          frameworks.push('Flutter');
        } else if (manifestName === 'package.json') {
          projType = 'web-frontend';
          frameworks.push('Node.js');
        } else if (manifestName === 'pom.xml' || manifestName.includes('gradle')) {
          projType = 'backend-api';
          frameworks.push('Java');
        } else if (manifestName.endsWith('.csproj') || manifestName.endsWith('.sln')) {
          projType = 'backend-api';
          frameworks.push('.NET');
        } else if (manifestName.endsWith('.dproj') || manifestName.endsWith('.dpr') || manifestName.endsWith('.dpk')) {
          projType = 'web-frontend';
          frameworks.push('Delphi VCL/FMX');
        } else if (manifestName === 'pyproject.toml' || manifestName === 'requirements.txt') {
          projType = 'backend-api';
          frameworks.push('Python');
        } else if (manifestName === 'cmakelists.txt' || manifestName.endsWith('.vcxproj')) {
          projType = 'library';
          frameworks.push('C/C++');
        } else if (manifestName.includes('docker')) {
          projType = 'infra';
          frameworks.push('Docker');
        } else if (manifestName.endsWith('.psd1')) {
          projType = 'cli';
          frameworks.push('PowerShell');
        } else if (manifestName === 'cpanfile' || manifestName === 'makefile.pl') {
          projType = 'backend-api';
          frameworks.push('Perl');
        }

        if (!projectMap.has(normDir)) {
          projectMap.set(normDir, {
            id: `project-${normDir.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            name: projectName,
            type: projType,
            languages: [],
            frameworks,
            rootPath: dir,
            entryPoints: [],
            loc: 0,
            fileCount: 0,
          });
        } else {
          const existing = projectMap.get(normDir)!;
          if (!existing.frameworks.includes(frameworks[0]) && frameworks[0]) {
            existing.frameworks.push(...frameworks);
          }
        }
      }
    }

    // 2. Assign files to projects and collect LOC stats
    let totalLoc = 0;
    const knownExts = new Set([
      '.java', '.cs', '.vb', '.fs', '.cpp', '.c', '.cc', '.cxx', '.h', '.hpp',
      '.pas', '.dpr', '.dpk', '.dfm', '.fmx', '.py', '.js', '.ts', '.jsx', '.tsx',
      '.dart', '.ps1', '.psm1', '.psd1', '.pl', '.pm', '.t', '.sh', '.bash',
      '.sql', '.yaml', '.yml', '.json', '.xml', '.dockerfile', '.proto'
    ]);

    for (const file of ctx.files) {
      const ext = file.extension.toLowerCase();
      const isAnalyzed = knownExts.has(ext) || path.basename(file.relativePath).toLowerCase().includes('dockerfile');

      let loc = 0;
      let text = ctx.fileTextCache.get(file.absolutePath);
      if (text === undefined) {
        const decoded = readFileText(file.absolutePath, ctx.options.fallbackEncoding);
        text = decoded.text;
        ctx.fileTextCache.set(file.absolutePath, text);
      }
      loc = text.split(/\r?\n/).filter(line => line.trim().length > 0).length;
      totalLoc += loc;

      const stat = extStats.get(ext) || { count: 0, loc: 0, analyzed: isAnalyzed };
      stat.count++;
      stat.loc += loc;
      extStats.set(ext, stat);

      // Find closest project
      let matchedProject: ArchProject | undefined;
      let longestMatch = -1;

      for (const [dirKey, proj] of projectMap.entries()) {
        if (dirKey === 'root') continue;
        if (file.relativePath.startsWith(proj.rootPath + '/') || file.relativePath === proj.rootPath) {
          if (proj.rootPath.length > longestMatch) {
            longestMatch = proj.rootPath.length;
            matchedProject = proj;
          }
        }
      }

      if (!matchedProject) {
        matchedProject = projectMap.get('root') || Array.from(projectMap.values())[0];
      }

      if (matchedProject) {
        matchedProject.fileCount++;
        matchedProject.loc += loc;
        if (ext && !matchedProject.languages.includes(ext)) {
          matchedProject.languages.push(ext);
        }
      }
    }

    // Populate model
    ctx.archModel.projects = Array.from(projectMap.values());
    ctx.archModel.workspace.stats.totalFiles = ctx.files.length;
    ctx.archModel.workspace.stats.totalLoc = totalLoc;
    ctx.archModel.workspace.stats.projectCount = ctx.archModel.projects.length;

    ctx.archModel.unsupportedFiles = Array.from(extStats.entries()).map(([ext, s]) => ({
      extension: ext || '(no extension)',
      languageId: ext.replace('.', '') || 'unknown',
      count: s.count,
      loc: s.loc,
      analyzed: s.analyzed,
    }));
  }
}
