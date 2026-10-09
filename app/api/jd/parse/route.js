import { getSessionOrThrow } from '../../../../lib/auth/session';
import { parseAndSaveJobDescription } from '../../../../lib/services/jd-service';
import { handleRouteError, ValidationError, FileTooLargeError } from '../../../../lib/utils/errors';
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req) {
  try {
    const session = await getSessionOrThrow();
    const contentType = req.headers.get('content-type') || '';

    let text = null;
    let fileBuffer = null;
    let mimeType = null;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const schema = z.object({ text: z.string().min(1) });
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError('Invalid JSON payload: missing or empty "text"');
      }
      text = parsed.data.text;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file || typeof file === 'string') {
        throw new ValidationError('No valid file uploaded');
      }
      
      if (file.size > MAX_FILE_SIZE) {
        throw new FileTooLargeError();
      }

      mimeType = file.type;
      fileBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      throw new ValidationError('Unsupported content type. Use application/json or multipart/form-data.');
    }

    const result = await parseAndSaveJobDescription({
      userId: session.user.id,
      text,
      fileBuffer,
      mimeType
    });

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
