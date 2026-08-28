import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiResponse>({ success: false, error }, { status });
}

export function validationError(error: string) {
  return errorResponse(error, 422);
}

export function unauthorizedError() {
  return errorResponse("Unauthorized", 401);
}

export function forbiddenError() {
  return errorResponse("Forbidden", 403);
}

export function notFoundError(resource = "Resource") {
  return errorResponse(`${resource} not found`, 404);
}

export function conflictError(error: string) {
  return errorResponse(error, 409);
}

export function serverError() {
  return errorResponse("Internal server error", 500);
}
