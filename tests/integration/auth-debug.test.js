import { describe, it } from 'vitest';
import { authConfig } from '../../lib/auth/auth.config';

describe('Auth Debug', () => {
  it('logs the provider', async () => {
    const provider = authConfig.providers[0];
    const p = typeof provider === 'function' ? provider() : provider;
    console.log("Provider object keys:", Object.keys(p));
    if (p.authorize) {
      console.log("Authorize toString:", p.authorize.toString());
    }
  });
});
