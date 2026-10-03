import * as iconv from 'iconv-lite';

export interface DecodedContent {
  text: string;
  encodingUsed: string;
}

/**
 * Robust encoding detector and decoder.
 * Sniffs BOMs for UTF-8, UTF-16 LE/BE, and falls back to UTF-8 or specified fallback (e.g. windows-1252).
 */
export function decodeFileContent(buffer: Buffer, fallbackEncoding = 'windows-1252'): DecodedContent {
  if (buffer.length === 0) {
    return { text: '', encodingUsed: 'utf-8' };
  }

  // Sniff BOM
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return { text: buffer.subarray(3).toString('utf8'), encodingUsed: 'utf-8-bom' };
  }

  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return { text: buffer.subarray(2).toString('utf16le'), encodingUsed: 'utf-16le' };
  }

  if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
    // Swap bytes for UTF-16 BE
    const swapped = Buffer.allocUnsafe(buffer.length - 2);
    for (let i = 2; i < buffer.length - 1; i += 2) {
      swapped[i - 2] = buffer[i + 1];
      swapped[i - 1] = buffer[i];
    }
    return { text: swapped.toString('utf16le'), encodingUsed: 'utf-16be' };
  }

  // Try UTF-8 validation
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const text = decoder.decode(buffer);
    return { text, encodingUsed: 'utf-8' };
  } catch {
    // Fallback to legacy ANSI encoding using iconv-lite
    try {
      if (iconv.encodingExists(fallbackEncoding)) {
        const text = iconv.decode(buffer, fallbackEncoding);
        return { text, encodingUsed: fallbackEncoding };
      }
    } catch {
      // Ignore iconv errors
    }
    // Absolute fallback
    return { text: buffer.toString('binary'), encodingUsed: 'binary-fallback' };
  }
}
