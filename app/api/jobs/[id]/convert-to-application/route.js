
import { getSessionOrThrow } from '../../../../../lib/auth/session';
import { getJobById } from '../../../../../lib/services/job-service';
import { createApplication } from '../../../../../lib/services/application-service';
import { handleRouteError } from '../../../../../lib/utils/errors';

export async function POST(request, { params }) {
  try {
    const session = await getSessionOrThrow();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const job = await getJobById(id, session.user.id);

    const applicationData = {
      jobId: job.id,
      company: job.company,
      role: job.role,
      location: job.location,
      status: 'SAVED',
    };

    const application = await createApplication(session.user.id, applicationData);

    return Response.json(application, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
