import { getSessionOrThrow } from '../../../../lib/auth/session.js';
import { getApplicationById, updateApplication, deleteApplication } from '../../../../lib/services/application-service.js';
import { updateApplicationSchema } from '../../../../lib/validation/schemas/application.js';
import { handleRouteError, ValidationError } from '../../../../lib/utils/errors.js';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const application = await getApplicationById((await params).id, session.user.id);
    return Response.json(application);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid application data');
    }

    const application = await updateApplication((await params).id, session.user.id, parsed.data);
    return Response.json(application);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    await deleteApplication((await params).id, session.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
