import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  validationError,
  notFoundError,
  serverError,
} from "@/lib/utils/api-response";
import { calculationUpdateSchema } from "@/lib/validations";
import {
  getCalculation,
  updateCalculation,
  deleteCalculation,
} from "@/lib/services/calculation.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { id } = await params;
    const data = await getCalculation(id, user.id);
    if (!data) return notFoundError("Calculation");

    return successResponse(data);
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { id } = await params;
    const body = await request.json();
    const parsed = calculationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    try {
      const data = await updateCalculation(id, user.id, parsed.data);
      return successResponse(data);
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { id } = await params;
    const existing = await getCalculation(id, user.id);
    if (!existing) return notFoundError("Calculation");

    await deleteCalculation(id, user.id);
    return successResponse({ deleted: true });
  } catch {
    return serverError();
  }
}
