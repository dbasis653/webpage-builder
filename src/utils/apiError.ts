export class ApiError extends Error {
  statusCode: number;
  errors: unknown[];
  success: false;
  data: null;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}
