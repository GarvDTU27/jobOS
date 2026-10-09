import { getSessionOrThrow } from '../../../../../lib/auth/session.js';
import { getTagsForApplication, addTagToApplication } from '../../../../../lib/services/tag-service.js';
import { addTagSchema } from '../../../../../lib/validation/schemas/tag.js';
import { handleRouteError, ValidationError } from '../../../../../lib/utils/errors.js';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const tags = await getTagsForApplication((await params).id, session.user.id);
    return Response.json(tags);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = addTagSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid tag data');
    }

    const tag = await addTagToApplication((await params).id, session.user.id, parsed.data.name);
    return Response.json(tag, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
