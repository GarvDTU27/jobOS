import { getSessionOrThrow } from '../../../../../lib/auth/session.js';
import { listEvents, createEvent } from '../../../../../lib/services/event-service.js';
import { createEventSchema } from '../../../../../lib/validation/schemas/event.js';
import { handleRouteError, ValidationError } from '../../../../../lib/utils/errors.js';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const events = await listEvents((await params).id, session.user.id);
    return Response.json(events);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid event data');
    }

    const event = await createEvent((await params).id, session.user.id, parsed.data);
    return Response.json(event, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
