import { DocumentParser, ParserError } from './contract';

export class TxtParser extends DocumentParser {
  async parse(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new ParserError('File is empty', 'EMPTY_CONTENT');
    }

    let text;
    try {
      // First try UTF-8
      text = buffer.toString('utf8');
      
      // A naive check: if it contains a lot of replacement characters (), it might not be UTF-8.
      // But in Node.js, we can just decode using latin1 as fallback if we want to be safe,
      // though 'utf8' usually doesn't throw, it just inserts replacement chars.
      // Let's implement the fallback properly if we can detect invalid UTF-8.
      
      // Node buffer.toString('utf8') replaces invalid sequences with  (U+FFFD).
      // If we see it, we can fallback to latin1.
      if (text.includes('\uFFFD')) {
        text = buffer.toString('latin1');
      }
    } catch (e) {
      // Fallback
      text = buffer.toString('latin1');
    }

    text = text.trim();

    if (!text) {
      throw new ParserError('File contains no text', 'EMPTY_CONTENT');
    }

    return text;
  }
}
