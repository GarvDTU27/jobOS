import { getSessionOrThrow } from '../../../../../lib/auth/session.js';
import { getApplicationById } from '../../../../../lib/services/application-service.js';
import prisma from '../../../../../lib/db/prisma.js';
import { handleRouteError } from '../../../../../lib/utils/errors.js';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    
    // Ensure application belongs to user
    await getApplicationById((await params).id, session.user.id);

    const history = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: (await params).id },
      orderBy: { changedAt: 'asc' },
    });

    return Response.json(history);
  } catch (error) {
    return handleRouteError(error);
  }
}
