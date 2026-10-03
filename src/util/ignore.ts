import * as path from 'path';

const ALWAYS_IGNORED_DIRS = new Set([
  'node_modules',
  'build',
  'dist',
  '.dart_tool',
  '.git',
  'bin',
  'obj',
  'target',
  'venv',
  '.idea',
  '.vscode',
  '.vs',
  'coverage',
  '__pycache__',
]);

const BINARY_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib', '.o', '.obj', '.a', '.lib',
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar',
  '.gz', '.7z', '.rar', '.iso', '.class', '.jar', '.war', '.ear',
  '.pyc', '.pyo', '.db', '.sqlite', '.sqlite3', '.dcu', '.res',
  '.exe', '.bpl', '.dcp', '.apk', '.aab', '.ipa'
]);

export function isIgnoredPath(filePath: string, customExcludes: string[] = []): boolean {
  const norm = filePath.replace(/\\/g, '/');
  const parts = norm.split('/');

  for (const part of parts) {
    if (ALWAYS_IGNORED_DIRS.has(part)) {
      return true;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return true;
  }

  for (const pattern of customExcludes) {
    const cleanPattern = pattern.replace(/^\*\*\//, '').replace(/\/\*\*$/, '');
    if (cleanPattern && norm.includes(cleanPattern)) {
      return true;
    }
  }

  return false;
}
