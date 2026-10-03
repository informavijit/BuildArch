import { describe, it, expect } from 'vitest';
import { decodeFileContent } from '../../src/languages/encoding.js';

describe('Encoding Detector', () => {
  it('sniffs UTF-8 BOM correctly', () => {
    const buf = Buffer.from([0xEF, 0xBB, 0xBF, 0x48, 0x65, 0x6C, 0x6C, 0x6F]);
    const res = decodeFileContent(buf);
    expect(res.encodingUsed).toBe('utf-8-bom');
    expect(res.text).toBe('Hello');
  });

  it('falls back to windows-1252 for legacy ANSI text', () => {
    const buf = Buffer.from([0xCF, 0xE0, 0xF1, 0xEA, 0xE0, 0xEB, 0xFF]); // Legacy ANSI
    const res = decodeFileContent(buf, 'windows-1252');
    expect(res.text).toBeTruthy();
  });
});
