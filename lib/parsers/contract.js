export class ParserError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
  }
}

/**
 * Base class for all document parsers
 */
export class DocumentParser {
  /**
   * Parse a file buffer and extract text.
   * @param {Buffer} buffer - The file content
   * @returns {Promise<string>} The extracted text
   * @throws {ParserError} If parsing fails or content is empty
   */
  async parse(buffer) {
    throw new Error('Not implemented');
  }
}
