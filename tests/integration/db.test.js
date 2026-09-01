// @vitest-environment node
import { describe, it, expect } from 'vitest';
import prisma from '../../lib/db/prisma.js';

describe('Database Connection', () => {
  it('connects to the database and can query', async () => {
    // Simple query to ensure connection is working without side effects
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result[0].result).toBe(1);
  });
});
