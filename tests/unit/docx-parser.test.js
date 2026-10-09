import { describe, it, expect } from 'vitest';
import { DocxParser } from '../../lib/parsers/docx-parser';
import { ParserError } from '../../lib/parsers/contract';
import { vi } from 'vitest';
import mammoth from 'mammoth';

vi.mock('mammoth', () => {
  return {
    default: {
      extractRawText: vi.fn(async ({ buffer }) => {
        const str = buffer.toString();
        if (str === 'invalid-docx') {
          throw new Error('Corrupt file');
        }
        if (str === 'empty-docx') {
          return { value: '', messages: [{ type: 'warning', message: 'Test warning' }] };
        }
        return { value: 'dummy docx text content', messages: [] };
      })
    }
  };
});

describe('DocxParser', () => {
  const parser = new DocxParser();

  it('parses a text-based DOCX', async () => {
    const buffer = Buffer.from('dummy docx');
    const text = await parser.parse(buffer);
    expect(text).toBe('dummy docx text content');
  });

  it('throws EMPTY_CONTENT for 0-byte buffer', async () => {
    const buffer = Buffer.alloc(0);
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
  });

  it('throws EMPTY_CONTENT and logs warnings for empty DOCX', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const buffer = Buffer.from('empty-docx');
    
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
    
    expect(warnSpy).toHaveBeenCalledWith('Mammoth warning: Test warning');
    warnSpy.mockRestore();
  });

  it('throws PARSE_ERROR for invalid DOCX buffer', async () => {
    const buffer = Buffer.from('invalid-docx');
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'PARSE_ERROR' });
  });
});
