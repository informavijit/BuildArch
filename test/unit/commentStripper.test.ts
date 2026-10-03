import { describe, it, expect } from 'vitest';
import { stripCommentsAndStrings } from '../../src/languages/comment-stripper.js';

describe('Comment and String Stripper', () => {
  it('strips C-style comments while keeping line count and strings intact for regex extraction', () => {
    const code = `
      // Line comment
      class Foo {
        /* Block
           Comment */
        String s = "Hello World";
      }
    `;
    const res = stripCommentsAndStrings(code, 'c-style');
    expect(res.strippedLines.length).toBe(res.originalLines.length);
    expect(res.code).not.toContain('Line comment');
    expect(res.code).not.toContain('Block');
    expect(res.code).toContain('Hello World');
  });

  it('strips Pascal comments ({ }, (* *), //)', () => {
    const pascalCode = `
      unit Test;
      { Pascal curly block }
      (* Pascal star block *)
      // Line comment
      implementation
      end.
    `;
    const res = stripCommentsAndStrings(pascalCode, 'pascal');
    expect(res.code).not.toContain('Pascal curly block');
    expect(res.code).not.toContain('Pascal star block');
    expect(res.code).not.toContain('Line comment');
  });
});
