import { getSessionOrThrow } from '../../../../../lib/auth/session.js';
import { listNotes, createNote } from '../../../../../lib/services/note-service.js';
import { createNoteSchema } from '../../../../../lib/validation/schemas/note.js';
import { handleRouteError, ValidationError } from '../../../../../lib/utils/errors.js';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const notes = await listNotes((await params).id, session.user.id);
    return Response.json(notes);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid note data');
    }

    const note = await createNote((await params).id, session.user.id, parsed.data);
    return Response.json(note, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
