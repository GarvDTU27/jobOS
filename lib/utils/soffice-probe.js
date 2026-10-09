import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

let hasLibreOffice = null;

export async function checkLibreOffice() {
  if (hasLibreOffice !== null) {
    return hasLibreOffice;
  }
  
  try {
    // Check if soffice is in PATH
    await execAsync('soffice --version');
    hasLibreOffice = true;
  } catch (e) {
    hasLibreOffice = false;
  }
  return hasLibreOffice;
}

export function setLibreOfficeStatusForTest(status) {
  hasLibreOffice = status;
}
