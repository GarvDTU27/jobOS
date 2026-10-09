import fs from 'node:fs/promises';
import path from 'node:path';
import { StorageProvider } from './provider';
import { AppError } from '../utils/errors';

export class LocalStorageProvider extends StorageProvider {
  constructor(baseDir = './uploads') {
    super();
    this.baseDir = path.resolve(process.cwd(), baseDir);
  }

  _validateKey(key) {
    // Prevent path traversal
    if (key.includes('..') || key.startsWith('/') || path.isAbsolute(key)) {
      throw new AppError('Invalid storage key: path traversal detected', 400, 'INVALID_KEY');
    }
  }

  _getFullPath(key) {
    this._validateKey(key);
    const fullPath = path.join(this.baseDir, key);
    // Double check that it's still within baseDir
    if (!fullPath.startsWith(this.baseDir)) {
      throw new AppError('Invalid storage key: path traversal detected', 400, 'INVALID_KEY');
    }
    return fullPath;
  }

  async save(buffer, key) {
    const fullPath = this._getFullPath(key);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(fullPath, buffer);
    return key;
  }

  async read(key) {
    const fullPath = this._getFullPath(key);
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new AppError(`File not found: ${key}`, 404, 'NOT_FOUND');
      }
      throw error;
    }
  }

  async delete(key) {
    const fullPath = this._getFullPath(key);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error; // Ignore if file already doesn't exist
      }
    }
  }
}
