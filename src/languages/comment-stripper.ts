export type CommentStyle = 'c-style' | 'python' | 'powershell' | 'pascal' | 'perl' | 'sql' | 'xml';

export interface StripResult {
  code: string;
  originalLines: string[];
  strippedLines: string[];
}

/**
 * Language-aware comment and string stripper.
 * Replaces characters inside comments and string literals with spaces/newlines, preserving original line numbers.
 */
export function stripCommentsAndStrings(text: string, style: CommentStyle = 'c-style'): StripResult {
  const originalLines = text.split(/\r?\n/);
  const chars = Array.from(text);
  const len = chars.length;

  let i = 0;
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;
  let blockCommentEnd = '';
  let inPerlPod = false;

  const resultChars = new Array<string>(len);

  while (i < len) {
    const ch = chars[i];
    const next = i + 1 < len ? chars[i + 1] : '';

    // Handle newline reset for line comments
    if (ch === '\n' || ch === '\r') {
      if (inLineComment) {
        inLineComment = false;
      }
      resultChars[i] = ch;
      i++;
      continue;
    }

    // Handle Perl POD block (=pod ... =cut)
    if (style === 'perl' && !inString && !inBlockComment && !inLineComment) {
      if (!inPerlPod && (i === 0 || chars[i - 1] === '\n') && ch === '=' && /[a-zA-Z]/.test(next)) {
        inPerlPod = true;
      }
      if (inPerlPod) {
        if ((i === 0 || chars[i - 1] === '\n') && text.substring(i, i + 4) === '=cut') {
          inPerlPod = false;
          resultChars[i] = ' '; resultChars[i + 1] = ' '; resultChars[i + 2] = ' '; resultChars[i + 3] = ' ';
          i += 4;
          continue;
        }
        resultChars[i] = ' ';
        i++;
        continue;
      }
    }

    // Inside block comment
    if (inBlockComment) {
      let isEnd = false;
      if (blockCommentEnd === '*/' && ch === '*' && next === '/') {
        isEnd = true;
        resultChars[i] = ' ';
        resultChars[i + 1] = ' ';
        i += 2;
      } else if (blockCommentEnd === '*)' && ch === '*' && next === ')') {
        isEnd = true;
        resultChars[i] = ' ';
        resultChars[i + 1] = ' ';
        i += 2;
      } else if (blockCommentEnd === '}' && ch === '}') {
        isEnd = true;
        resultChars[i] = ' ';
        i++;
      } else if (blockCommentEnd === '#>' && ch === '#' && next === '>') {
        isEnd = true;
        resultChars[i] = ' ';
        resultChars[i + 1] = ' ';
        i += 2;
      } else if (blockCommentEnd === '-->' && ch === '-' && next === '-' && i + 2 < len && chars[i + 2] === '>') {
        isEnd = true;
        resultChars[i] = ' '; resultChars[i + 1] = ' '; resultChars[i + 2] = ' ';
        i += 3;
      } else {
        resultChars[i] = ' ';
        i++;
      }

      if (isEnd) {
        inBlockComment = false;
        blockCommentEnd = '';
      }
      continue;
    }

    // Inside line comment
    if (inLineComment) {
      resultChars[i] = ' ';
      i++;
      continue;
    }

    // Inside string literal
    if (inString) {
      if (ch === '\\') {
        resultChars[i] = ch;
        if (i + 1 < len && chars[i + 1] !== '\n' && chars[i + 1] !== '\r') {
          resultChars[i + 1] = chars[i + 1];
          i += 2;
        } else {
          i++;
        }
        continue;
      }
      if (ch === stringChar) {
        inString = false;
        stringChar = '';
        resultChars[i] = ch;
        i++;
        continue;
      }
      resultChars[i] = ch;
      i++;
      continue;
    }

    // Check string starts
    if (ch === '"' || ch === "'" || ch === '`') {
      // Check multi-line string like Python """ or '''
      if (style === 'python' && (ch === '"' || ch === "'") && i + 2 < len && chars[i + 1] === ch && chars[i + 2] === ch) {
        // Handle triple quote
        const triple = ch + ch + ch;
        let endIdx = text.indexOf(triple, i + 3);
        if (endIdx !== -1) {
          for (let k = i; k < endIdx + 3; k++) {
            resultChars[k] = text[k] === '\n' || text[k] === '\r' ? text[k] : ' ';
          }
          i = endIdx + 3;
          continue;
        }
      }

      inString = true;
      stringChar = ch;
      resultChars[i] = ch;
      i++;
      continue;
    }

    // Check block comment starts
    if ((style === 'c-style' || style === 'sql' || style === 'pascal') && ch === '/' && next === '*') {
      inBlockComment = true;
      blockCommentEnd = '*/';
      resultChars[i] = ' ';
      resultChars[i + 1] = ' ';
      i += 2;
      continue;
    }

    if (style === 'pascal') {
      if (ch === '(' && next === '*') {
        inBlockComment = true;
        blockCommentEnd = '*)';
        resultChars[i] = ' ';
        resultChars[i + 1] = ' ';
        i += 2;
        continue;
      }
      if (ch === '{') {
        inBlockComment = true;
        blockCommentEnd = '}';
        resultChars[i] = ' ';
        i++;
        continue;
      }
    }

    if (style === 'powershell' && ch === '<' && next === '#') {
      inBlockComment = true;
      blockCommentEnd = '#>';
      resultChars[i] = ' ';
      resultChars[i + 1] = ' ';
      i += 2;
      continue;
    }

    if (style === 'xml' && ch === '<' && next === '!' && i + 3 < len && chars[i + 2] === '-' && chars[i + 3] === '-') {
      inBlockComment = true;
      blockCommentEnd = '-->';
      resultChars[i] = ' '; resultChars[i + 1] = ' '; resultChars[i + 2] = ' '; resultChars[i + 3] = ' ';
      i += 4;
      continue;
    }

    // Check line comment starts
    if ((style === 'c-style' || style === 'pascal') && ch === '/' && next === '/') {
      inLineComment = true;
      resultChars[i] = ' ';
      resultChars[i + 1] = ' ';
      i += 2;
      continue;
    }

    if ((style === 'python' || style === 'powershell' || style === 'perl') && ch === '#') {
      inLineComment = true;
      resultChars[i] = ' ';
      i++;
      continue;
    }

    if (style === 'sql' && ch === '-' && next === '-') {
      inLineComment = true;
      resultChars[i] = ' ';
      resultChars[i + 1] = ' ';
      i += 2;
      continue;
    }

    resultChars[i] = ch;
    i++;
  }

  const code = resultChars.join('');
  const strippedLines = code.split(/\r?\n/);

  return {
    code,
    originalLines,
    strippedLines,
  };
}

export function detectCommentStyle(ext: string): CommentStyle {
  const e = ext.toLowerCase();
  if (['.py', '.sh', '.bash', '.zsh', '.yaml', '.yml', 'dockerfile'].includes(e)) return 'python';
  if (['.ps1', '.psm1', '.psd1'].includes(e)) return 'powershell';
  if (['.pas', '.dpr', '.dpk', '.dfm', '.inc'].includes(e)) return 'pascal';
  if (['.pl', '.pm', '.t'].includes(e)) return 'perl';
  if (['.sql', '.prc', '.pks', '.pkb'].includes(e)) return 'sql';
  if (['.xml', '.html', '.xhtml', '.svg'].includes(e)) return 'xml';
  return 'c-style';
}
