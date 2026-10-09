import { fileTypeFromBuffer } from 'file-type';
import { TxtParser } from './txt-parser';
import { PdfParser } from './pdf-parser';
import { DocxParser } from './docx-parser';
import { DocParser } from './doc-parser';
import { ParserError } from './contract';

const txtParser = new TxtParser();
const pdfParser = new PdfParser();
const docxParser = new DocxParser();
const docParser = new DocParser();

/**
 * Detects the real MIME type from the buffer and dispatches to the correct parser.
 * @param {Buffer} buffer - File buffer
 * @param {string} declaredMimeType - Optional MIME type from the request/filename
 * @returns {Promise<string>} Parsed text
 */
export async function parseDocument(buffer, declaredMimeType = null) {
  if (!buffer || buffer.length === 0) {
    throw new ParserError('File is empty', 'EMPTY_CONTENT');
  }

  // Sniff MIME type
  const typeResult = await fileTypeFromBuffer(buffer);
  
  let effectiveMimeType = typeResult ? typeResult.mime : null;

  // Fallback to text/plain if fileTypeFromBuffer can't detect it,
  // since text files don't have magic numbers that file-type reliably detects.
  // We only fallback if the declared type is text/plain or if we have no other choice.
  if (!effectiveMimeType && declaredMimeType === 'text/plain') {
    effectiveMimeType = 'text/plain';
  } else if (!effectiveMimeType) {
    // If it can't be sniffed and no declared type, let's try text/plain as last resort
    effectiveMimeType = 'text/plain';
  }

  if (declaredMimeType && effectiveMimeType !== declaredMimeType && declaredMimeType !== 'application/octet-stream') {
    console.warn(`MIME type mismatch: declared '${declaredMimeType}', sniffed '${effectiveMimeType}'`);
  }

  switch (effectiveMimeType) {
    case 'application/pdf':
      return await pdfParser.parse(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await docxParser.parse(buffer);
    case 'application/msword':
      return await docParser.parse(buffer);
    case 'text/plain':
      return await txtParser.parse(buffer);
    default:
      throw new ParserError(`Unsupported file format: ${effectiveMimeType}`, 'UNSUPPORTED_FORMAT');
  }
}
