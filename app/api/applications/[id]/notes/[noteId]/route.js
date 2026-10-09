import { getSessionOrThrow } from '../../../../../../lib/auth/session.js';
import { updateNote, deleteNote } from '../../../../../../lib/services/note-service.js';
import { updateNoteSchema } from '../../../../../../lib/validation/schemas/note.js';
import { handleRouteError, ValidationError } from '../../../../../../lib/utils/errors.js';

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid note data');
    }

    const note = await updateNote((await params).noteId, (await params).id, session.user.id, parsed.data);
    return Response.json(note);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    await deleteNote((await params).noteId, (await params).id, session.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
