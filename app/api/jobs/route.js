import { getSessionOrThrow } from '../../../lib/auth/session';
import { createJob, listJobs } from '../../../lib/services/job-service';
import { createJobSchema } from '../../../lib/validation/schemas/job';
import { handleRouteError, ValidationError } from '../../../lib/utils/errors';

export async function POST(request) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = createJobSchema.parse(body);
    } catch (e) {
      if (e.name === 'ZodError') {
        throw new ValidationError('Validation error', e.issues);
      }
      throw e;
    }

    const job = await createJob(session.user.id, validatedData);
    return Response.json(job, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(request.url);
    const options = {
      skip: searchParams.has('skip') ? parseInt(searchParams.get('skip')) : 0,
      take: searchParams.has('take') ? parseInt(searchParams.get('take')) : 50,
      search: searchParams.get('search') || undefined,
      archived: searchParams.get('archived') === 'true',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const result = await listJobs(session.user.id, options);
    return Response.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
