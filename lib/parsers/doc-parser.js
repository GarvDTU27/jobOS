import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { DocumentParser, ParserError } from './contract';
import { DocxParser } from './docx-parser';
import { checkLibreOffice } from '../utils/soffice-probe';

const execAsync = promisify(exec);

export class DocParser extends DocumentParser {
  constructor() {
    super();
    this.docxParser = new DocxParser();
  }

  async parse(buffer) {
    if (!buffer || buffer.length === 0) {
      throw new ParserError('File is empty', 'EMPTY_CONTENT');
    }

    const hasSOffice = await checkLibreOffice();
    if (!hasSOffice) {
      throw new ParserError(
        'LibreOffice is not installed or not in PATH. Cannot parse legacy .doc files.',
        'CONVERSION_TOOL_UNAVAILABLE'
      );
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jobos-doc-'));
    const docId = crypto.randomUUID();
    const docPath = path.join(tempDir, `${docId}.doc`);
    const docxPath = path.join(tempDir, `${docId}.docx`);

    try {
      // Write buffer to temp .doc file
      await fs.writeFile(docPath, buffer);

      // Convert using libreoffice
      // The --outdir parameter specifies where the result goes
      await execAsync(`soffice --headless --convert-to docx "${docPath}" --outdir "${tempDir}"`);

      // Check if docx was generated
      let docxBuffer;
      try {
        docxBuffer = await fs.readFile(docxPath);
      } catch (err) {
        throw new ParserError('Failed to convert .doc to .docx', 'CONVERSION_ERROR');
      }

      // Delegate to DocxParser
      return await this.docxParser.parse(docxBuffer);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Failed to parse DOC: ${error.message}`, 'PARSE_ERROR');
    } finally {
      // Clean up temp directory
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
