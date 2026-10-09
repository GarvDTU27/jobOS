import { getSessionOrThrow } from '../../../../../../lib/auth/session.js';
import { removeTagFromApplication } from '../../../../../../lib/services/tag-service.js';
import { handleRouteError } from '../../../../../../lib/utils/errors.js';

export async function DELETE(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    await removeTagFromApplication((await params).id, session.user.id, (await params).tagId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
