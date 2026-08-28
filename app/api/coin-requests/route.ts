import { NextRequest } from "next/server";
import { getCurrentUser, hasAdminScope } from "@/lib/permissions";
import {
  successResponse,
  unauthorizedError,
  validationError,
  conflictError,
  serverError,
} from "@/lib/utils/api-response";
import { coinRequestSchema } from "@/lib/validations";
import {
  listCoinRequests,
  createCoinRequest,
} from "@/lib/services/coin-request.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const adminScope = hasAdminScope(user.profile);
    const result = await listCoinRequests({
      userId: user.id,
      adminScope,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "10"),
      search: searchParams.get("search") ?? undefined,
      paymentStatus: searchParams.get("payment_status") ?? undefined,
      sendStatus: searchParams.get("send_status") ?? undefined,
      paymentMethod: searchParams.get("payment_method") ?? undefined,
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
    const parsed = coinRequestSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.issues[0]?.message ?? "Validation failed");
    }

    try {
      const data = await createCoinRequest(user.id, parsed.data);
      return successResponse(data, 201);
    } catch (err) {
      if (err instanceof Error && err.message === "DUPLICATE_REQUEST_ID") {
        return conflictError("Request ID already exists");
      }
      throw err;
    }
  } catch {
    return serverError();
  }
}
