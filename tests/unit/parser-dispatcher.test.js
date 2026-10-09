import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDocument } from '../../lib/parsers/index';
import { ParserError } from '../../lib/parsers/contract';
import * as fileType from 'file-type';

vi.mock('file-type', () => ({
  fileTypeFromBuffer: vi.fn()
}));

// Mock the individual parsers
vi.mock('../../lib/parsers/txt-parser', () => ({
  TxtParser: class { async parse() { return 'txt content'; } }
}));
vi.mock('../../lib/parsers/pdf-parser', () => ({
  PdfParser: class { async parse() { return 'pdf content'; } }
}));
vi.mock('../../lib/parsers/docx-parser', () => ({
  DocxParser: class { async parse() { return 'docx content'; } }
}));
vi.mock('../../lib/parsers/doc-parser', () => ({
  DocParser: class { async parse() { return 'doc content'; } }
}));

describe('Parser Dispatcher', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('dispatches to PDF parser when sniffed as PDF', async () => {
    fileType.fileTypeFromBuffer.mockResolvedValue({ mime: 'application/pdf' });
    const text = await parseDocument(Buffer.from('dummy'));
    expect(text).toBe('pdf content');
  });

  it('routes by sniffed type, ignoring incorrect declared type', async () => {
    fileType.fileTypeFromBuffer.mockResolvedValue({ mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Declared as PDF, but sniffed as DOCX
    const text = await parseDocument(Buffer.from('dummy'), 'application/pdf');
    
    expect(text).toBe('docx content');
    expect(warnSpy).toHaveBeenCalledWith("MIME type mismatch: declared 'application/pdf', sniffed 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'");
    warnSpy.mockRestore();
  });

  it('falls back to text/plain if file-type cannot detect it', async () => {
    fileType.fileTypeFromBuffer.mockResolvedValue(undefined);
    
    const text = await parseDocument(Buffer.from('hello text'), 'text/plain');
    expect(text).toBe('txt content');
  });

  it('throws UNSUPPORTED_FORMAT for unknown mime types', async () => {
    fileType.fileTypeFromBuffer.mockResolvedValue({ mime: 'image/png' });
    
    await expect(parseDocument(Buffer.from('dummy'))).rejects.toThrow(ParserError);
    await expect(parseDocument(Buffer.from('dummy'))).rejects.toMatchObject({ code: 'UNSUPPORTED_FORMAT' });
  });

  it('throws EMPTY_CONTENT for 0-byte buffer', async () => {
    await expect(parseDocument(Buffer.alloc(0))).rejects.toThrow(ParserError);
    await expect(parseDocument(Buffer.alloc(0))).rejects.toMatchObject({ code: 'EMPTY_CONTENT' });
  });
});
