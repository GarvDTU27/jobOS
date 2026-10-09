import { getSessionOrThrow } from '../../../../../lib/auth/session.js';
import { updateStatus } from '../../../../../lib/services/application-service.js';
import { updateStatusSchema } from '../../../../../lib/validation/schemas/application.js';
import { handleRouteError, ValidationError } from '../../../../../lib/utils/errors.js';

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid status data');
    }

    const { status, note } = parsed.data;
    const application = await updateStatus((await params).id, session.user.id, status, note);
    return Response.json(application);
  } catch (error) {
    return handleRouteError(error);
  }
}
