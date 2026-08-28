import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  validationError,
  serverError,
} from "@/lib/utils/api-response";
import { calculationSchema } from "@/lib/validations";
import {
  listCalculations,
  createCalculation,
} from "@/lib/services/calculation.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const result = await listCalculations({
      userId: user.id,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "10"),
      search: searchParams.get("search") ?? undefined,
      sortBy: searchParams.get("sort_by") ?? undefined,
      sortOrder: (searchParams.get("sort_order") as "asc" | "desc") ?? undefined,
      dateFrom: searchParams.get("date_from") ?? undefined,
      dateTo: searchParams.get("date_to") ?? undefined,
    });

    return successResponse(result);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const parsed = calculationSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    const data = await createCalculation(user.id, parsed.data);
    return successResponse(data, 201);
  } catch {
    return serverError();
  }
}
