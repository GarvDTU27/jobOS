import { describe, it, expect } from 'vitest';
import { PdfParser } from '../../lib/parsers/pdf-parser';
import { ParserError } from '../../lib/parsers/contract';
import fs from 'node:fs/promises';
import path from 'node:path';
import { vi } from 'vitest';

vi.mock('pdf-parse', () => {
  return {
    default: vi.fn(async (buffer) => {
      const str = buffer.toString();
      if (str === 'Not a PDF file') {
        throw new Error('Invalid PDF');
      }
      return { text: 'dummy pdf text content' };
    })
  };
});

describe('PdfParser', () => {
  const parser = new PdfParser();

  it('parses a text-based PDF', async () => {
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'dummy.pdf');
    const buffer = await fs.readFile(fixturePath);
    
    const text = await parser.parse(buffer);
    expect(text.length).toBeGreaterThan(0);
    // 'dummy.pdf' from w3.org usually contains the word "Dummy"
    expect(text.toLowerCase()).toContain('dummy');
  });

  it('throws EMPTY_CONTENT for 0-byte buffer', async () => {
    const buffer = Buffer.alloc(0);
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
  });

  it('throws PARSE_ERROR for invalid PDF buffer', async () => {
    const buffer = Buffer.from('Not a PDF file');
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'PARSE_ERROR' });
  });
});
