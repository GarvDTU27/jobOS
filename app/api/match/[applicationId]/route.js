import { getSessionOrThrow } from '../../../../lib/auth/session.js';
import { getMatchAnalysisByApplicationId } from '../../../../lib/services/match-service.js';
import { handleRouteError } from '../../../../lib/utils/errors.js';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const resolvedParams = await params;
    const applicationId = resolvedParams.applicationId;

    const analysis = await getMatchAnalysisByApplicationId(session.user.id, applicationId);
    return Response.json({ data: analysis }, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
