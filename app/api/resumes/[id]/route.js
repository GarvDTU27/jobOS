import { NextResponse } from 'next/server';
import { getSessionOrThrow } from '../../../../lib/auth/session';
import { resumeService } from '../../../../lib/services/resume-service';
import { handleRouteError } from '../../../../lib/utils/errors';
import { z } from 'zod';

const updateResumeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  isDefault: z.boolean().optional()
});

export async function GET(request, { params }) {
  try {
    const session = await getSessionOrThrow(request);
    const resume = await resumeService.getResume(session.userId, params.id);
    return NextResponse.json({ data: resume });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionOrThrow(request);
    const body = await request.json();
    const validatedData = updateResumeSchema.parse(body);

    const resume = await resumeService.updateResume(session.userId, params.id, validatedData);
    return NextResponse.json({ data: resume });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSessionOrThrow(request);
    await resumeService.deleteResume(session.userId, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
