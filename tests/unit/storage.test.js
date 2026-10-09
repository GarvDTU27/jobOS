import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageProvider } from '../../lib/storage/local-provider';
import { FileError } from '../../lib/utils/errors';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('LocalStorageProvider', () => {
  let provider;
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jobos-test-'));
    provider = new LocalStorageProvider(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('saves and reads a file', async () => {
    const key = 'user1/resume.pdf';
    const content = Buffer.from('dummy pdf content');
    
    await provider.save(content, key);
    
    const readBack = await provider.read(key);
    expect(readBack.toString()).toBe('dummy pdf content');
  });

  it('deletes a file', async () => {
    const key = 'user1/to-delete.txt';
    const content = Buffer.from('delete me');
    
    await provider.save(content, key);
    await provider.delete(key);
    
    await expect(provider.read(key)).rejects.toThrow(FileError);
  });

  it('rejects path traversal attempts', async () => {
    const maliciousKeys = [
      '../../etc/passwd',
      '/etc/passwd',
      'user1/../../etc/passwd'
    ];

    for (const key of maliciousKeys) {
      await expect(provider.save(Buffer.from('hack'), key)).rejects.toThrow(FileError);
      await expect(provider.read(key)).rejects.toThrow(FileError);
      await expect(provider.delete(key)).rejects.toThrow(FileError);
    }
  });

  it('throws FileError when reading non-existent file', async () => {
    await expect(provider.read('does-not-exist.txt')).rejects.toThrow(FileError);
  });
});
