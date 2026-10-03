import { ArchModel, ArchRelationship } from '../model/archModel.js';

/**
 * Deterministic Cross-Language Linker.
 * Matches endpoints, native DLLs, process calls, and shared schemas across different programming languages.
 */
export function linkCrossLanguageComponents(archModel: ArchModel): void {
  // 1. Link HTTP Client calls to REST Interfaces
  for (const rel of [...archModel.relationships]) {
    if (rel.kind === 'http' && rel.toId.startsWith('http-')) {
      const targetUrl = rel.toId.replace('http-', '').toLowerCase();

      // Find matching interface in another language/project
      const matchedIface = archModel.interfaces.find(iface => {
        const p = iface.path.toLowerCase();
        return p === targetUrl || targetUrl.includes(p) || p.includes(targetUrl);
      });

      if (matchedIface) {
        const targetComp = archModel.components.find(c => c.paths.includes(matchedIface.file) || c.projectId === matchedIface.projectId);
        if (targetComp) {
          archModel.relationships.push({
            id: `cross-http-${rel.id}`,
            fromId: rel.fromId,
            toId: targetComp.id,
            kind: 'http',
            label: `Cross-Language HTTP API Call: ${rel.label} -> ${matchedIface.path}`,
            evidence: [
              ...(rel.evidence || []),
              { file: matchedIface.file, line: matchedIface.line, snippet: `Handler: ${matchedIface.handler}` },
            ],
            confidence: 'Extracted',
          });
        }
      }
    }
  }

  // 2. Link Native DLL Calls (C# DllImport, Delphi external) to C/C++ DLL components
  for (const rel of [...archModel.relationships]) {
    if (rel.kind === 'native-dll' && rel.toId.startsWith('external-')) {
      const dllName = rel.toId.replace('external-', '').replace(/\.(dll|so|dylib)$/i, '').toLowerCase();

      const matchedCpp = archModel.components.find(c => {
        const cName = c.name.toLowerCase();
        return cName.includes(dllName) || dllName.includes(cName) || c.language === 'C++';
      });

      if (matchedCpp) {
        archModel.relationships.push({
          id: `cross-dll-${rel.id}`,
          fromId: rel.fromId,
          toId: matchedCpp.id,
          kind: 'native-dll',
          label: `Cross-Language Native Interop (P/Invoke DLL): ${dllName} -> ${matchedCpp.name}`,
          evidence: rel.evidence,
          confidence: 'Extracted',
        });
      }
    }
  }

  // 3. Link Process Executable Calls (PowerShell, Perl, Shell) to Target Project Binaries
  for (const rel of [...archModel.relationships]) {
    if (rel.kind === 'process-call' && rel.toId.startsWith('proc-') || rel.toId.startsWith('sys-')) {
      const procName = rel.toId.replace(/^(proc-|sys-)/, '').replace(/\.(exe|cmd|bat|sh)$/i, '').toLowerCase();

      const matchedTarget = archModel.projects.find(p => p.name.toLowerCase().includes(procName) || procName.includes(p.name.toLowerCase()));
      if (matchedTarget) {
        const targetComp = archModel.components.find(c => c.projectId === matchedTarget.id);
        if (targetComp) {
          archModel.relationships.push({
            id: `cross-proc-${rel.id}`,
            fromId: rel.fromId,
            toId: targetComp.id,
            kind: 'process-call',
            label: `Cross-Language Process Execution: ${procName} -> ${matchedTarget.name}`,
            evidence: rel.evidence,
            confidence: 'Extracted',
          });
        }
      }
    }
  }
}
