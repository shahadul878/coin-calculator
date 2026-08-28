import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  notFoundError,
  serverError,
} from "@/lib/utils/api-response";
import { duplicateCalculation } from "@/lib/services/calculation.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { id } = await params;

    try {
      const data = await duplicateCalculation(id, user.id);
      return successResponse(data, 201);
    } catch (err) {
      if (err instanceof Error && err.message === "Calculation not found") {
        return notFoundError("Calculation");
      }
      throw err;
    }
  } catch {
    return serverError();
  }
}
