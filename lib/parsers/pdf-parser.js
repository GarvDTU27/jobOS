import pdfParse from 'pdf-parse';
import { DocumentParser, ParserError } from './contract';

export class PdfParser extends DocumentParser {
  async parse(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new ParserError('File is empty', 'EMPTY_CONTENT');
    }

    try {
      const data = await pdfParse(buffer);
      const text = data.text ? data.text.trim() : '';

      if (!text) {
        throw new ParserError('PDF contains no readable text (might be scanned or empty)', 'EMPTY_CONTENT');
      }

      return text;
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Failed to parse PDF: ${error.message}`, 'PARSE_ERROR');
    }
  }
}
