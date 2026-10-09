import { getSessionOrThrow } from '../../../lib/auth/session.js';
import { createApplication, listApplications } from '../../../lib/services/application-service.js';
import { createApplicationSchema } from '../../../lib/validation/schemas/application.js';
import { handleRouteError, ValidationError } from '../../../lib/utils/errors.js';

export async function GET(request) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '50', 10);
    const search = searchParams.get('search');
    const status = searchParams.getAll('status');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    const options = {
      skip, take,
      ...(search && { search }),
      ...(status.length > 0 && { status }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder })
    };

    const result = await listApplications(session.user.id, options);
    return Response.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid application data');
    }

    const application = await createApplication(session.user.id, parsed.data);
    return Response.json(application, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
