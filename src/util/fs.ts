import * as fs from 'fs';
import * as path from 'path';
import { decodeFileContent, DecodedContent } from '../languages/encoding.js';
import { isIgnoredPath } from './ignore.js';

export interface FileEntry {
  relativePath: string;
  absolutePath: string;
  extension: string;
  sizeBytes: number;
}

export function scanDirectory(
  dirPath: string,
  baseDir: string = dirPath,
  maxFiles = 20000,
  maxFileSizeKB = 512,
  customExcludes: string[] = []
): FileEntry[] {
  const entries: FileEntry[] = [];

  function walk(currentDir: string) {
    if (entries.length >= maxFiles) return;

    let items: fs.Dirent[];
    try {
      items = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const item of items) {
      if (entries.length >= maxFiles) break;

      const fullPath = path.join(currentDir, item.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (isIgnoredPath(relPath, customExcludes)) {
        continue;
      }

      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.isFile()) {
        try {
          const stat = fs.statSync(fullPath);
          if (stat.size <= maxFileSizeKB * 1024) {
            entries.push({
              relativePath: relPath,
              absolutePath: fullPath,
              extension: path.extname(item.name).toLowerCase(),
              sizeBytes: stat.size,
            });
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  }

  walk(dirPath);
  return entries;
}

export function readFileText(absolutePath: string, fallbackEncoding = 'windows-1252'): DecodedContent {
  try {
    const buffer = fs.readFileSync(absolutePath);
    return decodeFileContent(buffer, fallbackEncoding);
  } catch (err: any) {
    return { text: '', encodingUsed: 'read-error: ' + (err?.message || 'unknown') };
  }
}
