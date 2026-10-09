import { NextResponse } from 'next/server';
import { getSessionOrThrow } from '../../../lib/auth/session';
import { resumeService } from '../../../lib/services/resume-service';
import { uploadResumeSchema, ALLOWED_MIME_TYPES, MAX_RESUME_SIZE } from '../../../lib/validation/schemas/resume';
import { handleRouteError } from '../../../lib/utils/errors';

export async function POST(request) {
  try {
    const session = await getSessionOrThrow(request);
    const formData = await request.formData();
    
    const file = formData.get('file');
    const name = formData.get('name');
    const isDefaultStr = formData.get('isDefault');
    const isDefault = isDefaultStr === 'true';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: { message: 'File is required' } }, { status: 400 });
    }

    const fileType = file.type;
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json({ error: { message: 'Unsupported file type' } }, { status: 422 });
    }

    if (file.size > MAX_RESUME_SIZE) {
      return NextResponse.json({ error: { message: 'File size exceeds limit' } }, { status: 413 });
    }

    const validatedData = uploadResumeSchema.parse({ name, isDefault });
    const buffer = Buffer.from(await file.arrayBuffer());

    const resume = await resumeService.uploadResume(
      session.userId,
      buffer,
      fileType,
      file.name,
      validatedData.name,
      validatedData.isDefault
    );

    return NextResponse.json({ data: resume }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request) {
  try {
    const session = await getSessionOrThrow(request);
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const resumes = await resumeService.listResumes(session.userId, includeArchived);
    return NextResponse.json({ data: resumes });
  } catch (error) {
    return handleRouteError(error);
  }
}
