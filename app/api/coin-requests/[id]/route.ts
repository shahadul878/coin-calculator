import { NextRequest } from "next/server";
import { getCurrentUser, hasAdminScope } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  validationError,
  notFoundError,
  conflictError,
  serverError,
} from "@/lib/utils/api-response";
import { coinRequestUpdateSchema } from "@/lib/validations";
import {
  getCoinRequest,
  updateCoinRequest,
  deleteCoinRequest,
} from "@/lib/services/coin-request.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const adminScope = hasAdminScope(user.profile);
    const { id } = await params;
    const data = await getCoinRequest(id, user.id, { adminScope });
    if (!data) return notFoundError("Coin request");

    return successResponse(data);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const adminScope = hasAdminScope(user.profile);
    const { id } = await params;
    const body = await request.json();
    const parsed = coinRequestUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    try {
      const data = await updateCoinRequest(id, user.id, parsed.data, { adminScope });
      return successResponse(data);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "Coin request not found") return notFoundError("Coin request");
        if (err.message === "DUPLICATE_REQUEST_ID") return conflictError("Request ID already exists");
      }
      throw err;
    }
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const adminScope = hasAdminScope(user.profile);
    const { id } = await params;
    const existing = await getCoinRequest(id, user.id, { adminScope });
    if (!existing) return notFoundError("Coin request");

    await deleteCoinRequest(id, user.id, { adminScope });
    return successResponse({ deleted: true });
  } catch {
    return serverError();
  }
}
