export class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class FileTooLargeError extends AppError {
  constructor(message = 'File Too Large') {
    super(message, 413, 'FILE_TOO_LARGE');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export function handleRouteError(error) {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  console.error('Unhandled Route Error:', error);
  
  const isDev = process.env.NODE_ENV !== 'production';
  return Response.json(
    { 
      error: { 
        code: 'INTERNAL_SERVER_ERROR', 
        message: 'An unexpected error occurred.',
        ...(isDev && { stack: error.stack })
      } 
    },
    { status: 500 }
  );
}
