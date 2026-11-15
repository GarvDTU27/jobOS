import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/db/prisma.js', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock('../../lib/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import prisma from '../../lib/db/prisma.js';
import { GET } from '../../app/api/health/route.js';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and healthy status when database responds', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
    expect(data.timestamp).toBeDefined();
    expect(data.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns 503 and unhealthy status when database throws an error', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.database).toBe('disconnected');
    expect(data.error).toBe('Connection refused');
    expect(data.timestamp).toBeDefined();
  });
});
