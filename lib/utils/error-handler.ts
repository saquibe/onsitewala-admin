// lib/utils/error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}
