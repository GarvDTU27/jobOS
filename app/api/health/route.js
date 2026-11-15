import prisma from '../../../lib/db/prisma.js';
import { logger } from '../../../lib/utils/logger.js';

export async function GET() {
  const startTime = Date.now();
  try {
    // Ping PostgreSQL to confirm active connection pool
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return Response.json(
      {
        status: 'healthy',
        database: 'connected',
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    logger.error('Database connection failed during health check', {
      error: error.message,
      latencyMs,
    });

    return Response.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
