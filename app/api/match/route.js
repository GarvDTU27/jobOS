import { getSessionOrThrow } from '../../../lib/auth/session.js';
import { runMatchAnalysis, getMatchAnalysisByApplicationId } from '../../../lib/services/match-service.js';
import { runMatchSchema } from '../../../lib/validation/schemas/match.js';
import { handleRouteError, ValidationError } from '../../../lib/utils/errors.js';
import { logger } from '../../../lib/utils/logger.js';

export async function POST(request) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();

    const parsed = runMatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || 'Invalid match request payload');
    }

    const analysis = await runMatchAnalysis({
      userId: session.user.id,
      applicationId: parsed.data.applicationId,
      resumeId: parsed.data.resumeId,
      jobId: parsed.data.jobId,
    });

    logger.info('Match analysis generated via POST /api/match', {
      userId: session.user.id,
      applicationId: parsed.data.applicationId,
      score: analysis.overallScore,
    });

    return Response.json({ data: analysis }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      throw new ValidationError('applicationId query parameter is required');
    }

    const analysis = await getMatchAnalysisByApplicationId(session.user.id, applicationId);
    return Response.json({ data: analysis }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
