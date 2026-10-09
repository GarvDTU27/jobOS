/**
 * Storage Provider Interface
 * Defines the contract for file storage implementations.
 */
export class StorageProvider {
  /**
   * Save a file buffer to storage.
   * @param {Buffer} buffer - The file content
   * @param {string} key - The unique storage key (e.g., 'userId/filename.ext')
   * @returns {Promise<string>} The storage URI or key
   */
  async save(buffer, key) {
    throw new Error('Not implemented');
  }

  /**
   * Read a file from storage.
   * @param {string} key - The unique storage key
   * @returns {Promise<Buffer>} The file content
   */
  async read(key) {
    throw new Error('Not implemented');
  }

  /**
   * Delete a file from storage.
   * @param {string} key - The unique storage key
   * @returns {Promise<void>}
   */
  async delete(key) {
    throw new Error('Not implemented');
  }
}
