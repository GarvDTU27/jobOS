import { getSessionOrThrow } from '../../../../lib/auth/session';
import { getJobById, updateJob, deleteJob, archiveJob } from '../../../../lib/services/job-service';
import { updateJobSchema } from '../../../../lib/validation/schemas/job';
import { handleRouteError, ValidationError } from '../../../../lib/utils/errors';

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const job = await getJobById(id, session.user.id);
    return Response.json(job);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (body.archived !== undefined && Object.keys(body).length === 1) {
      const job = await archiveJob(id, session.user.id, body.archived);
      return Response.json(job);
    }

    let validatedData;
    try {
      validatedData = updateJobSchema.parse(body);
    } catch (e) {
      if (e.name === 'ZodError') {
        throw new ValidationError('Validation error', e.issues);
      }
      throw e;
    }
    
    const job = await updateJob(id, session.user.id, validatedData);
    return Response.json(job);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    await deleteJob(id, session.user.id, force);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
