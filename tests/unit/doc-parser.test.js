import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocParser } from '../../lib/parsers/doc-parser';
import { ParserError } from '../../lib/parsers/contract';
import { setLibreOfficeStatusForTest, checkLibreOffice } from '../../lib/utils/soffice-probe';
import fs from 'node:fs/promises';
import path from 'node:path';

describe('DocParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DocParser();
  });

  it('throws CONVERSION_TOOL_UNAVAILABLE if soffice is missing', async () => {
    setLibreOfficeStatusForTest(false);
    
    const buffer = Buffer.from('dummy doc');
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'CONVERSION_TOOL_UNAVAILABLE' });
  });

  it('throws EMPTY_CONTENT for 0-byte buffer', async () => {
    const buffer = Buffer.alloc(0);
    await expect(parser.parse(buffer)).rejects.toThrow(ParserError);
    await expect(parser.parse(buffer)).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
  });
});
