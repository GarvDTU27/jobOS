import { LocalStorageProvider } from './local-provider';

let providerInstance = null;

export function getStorageProvider() {
  if (!providerInstance) {
    const driver = process.env.FILE_STORAGE_DRIVER || 'local';
    
    switch (driver) {
      case 'local':
        providerInstance = new LocalStorageProvider();
        break;
      // Add other providers here (e.g. S3) in the future
      default:
        providerInstance = new LocalStorageProvider();
    }
  }
  return providerInstance;
}
