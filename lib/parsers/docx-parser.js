import mammoth from 'mammoth';
import { DocumentParser, ParserError } from './contract';

export class DocxParser extends DocumentParser {
  async parse(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new ParserError('File is empty', 'EMPTY_CONTENT');
    }

    try {
      const result = await mammoth.extractRawText({ buffer });
      
      // Log warnings (as per acceptance criteria)
      if (result.messages && result.messages.length > 0) {
        result.messages.forEach(msg => {
          if (msg.type === 'warning') {
            console.warn(`Mammoth warning: ${msg.message}`);
          }
        });
      }

      const text = result.value ? result.value.trim() : '';

      if (!text) {
        throw new ParserError('DOCX contains no readable text', 'EMPTY_CONTENT');
      }

      return text;
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Failed to parse DOCX: ${error.message}`, 'PARSE_ERROR');
    }
  }
}
