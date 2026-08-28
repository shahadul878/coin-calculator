import { NextRequest } from "next/server";
import { getCurrentUser, hasAdminScope } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  notFoundError,
  serverError,
} from "@/lib/utils/api-response";
import { duplicateCoinRequest } from "@/lib/services/coin-request.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const adminScope = hasAdminScope(user.profile);
    const { id } = await params;

    try {
      const data = await duplicateCoinRequest(id, user.id, { adminScope });
      return successResponse(data, 201);
    } catch (err) {
      if (err instanceof Error && err.message === "Coin request not found") {
        return notFoundError("Coin request");
      }
      throw err;
    }
  } catch {
    return serverError();
  }
}
