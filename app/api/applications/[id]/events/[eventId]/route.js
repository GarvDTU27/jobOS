import { getSessionOrThrow } from '../../../../../../lib/auth/session.js';
import { updateEvent, deleteEvent } from '../../../../../../lib/services/event-service.js';
import { updateEventSchema } from '../../../../../../lib/validation/schemas/event.js';
import { handleRouteError, ValidationError } from '../../../../../../lib/utils/errors.js';

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid event data');
    }

    const event = await updateEvent((await params).eventId, (await params).id, session.user.id, parsed.data);
    return Response.json(event);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    await deleteEvent((await params).eventId, (await params).id, session.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
