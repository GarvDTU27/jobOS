import { describe, it, expect } from 'vitest';
import { TxtParser } from '../../lib/parsers/txt-parser';
import { ParserError } from '../../lib/parsers/contract';

describe('TxtParser', () => {
  const parser = new TxtParser();

  it('parses basic UTF-8 text', async () => {
    const buffer = Buffer.from('Hello, world! 🌍', 'utf8');
    const text = await parser.parse(buffer);
    expect(text).toBe('Hello, world! 🌍');
  });

  it('falls back to latin1 for non-UTF8 sequences', async () => {
    // A buffer with invalid UTF-8 (e.g. 0xE9 alone is é in latin1 but invalid in utf8)
    const buffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0xE9]);
    const text = await parser.parse(buffer);
    expect(text).toBe('Hello é');
  });

  it('throws EMPTY_CONTENT for 0-byte buffer', async () => {
    const buffer = Buffer.alloc(0);
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
  });

  it('throws EMPTY_CONTENT for whitespace-only text', async () => {
    const buffer = Buffer.from('   \n  \t  ');
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
  });
});
