export type UserRole = "user" | "admin";

export type PaymentStatus = "paid" | "due" | "partial";

export type SendStatus = "done" | "pending" | "cancel";

export type PaymentMethod = "bkash" | "nagad" | "others";

export type AuditAction =
  | "CREATE_COIN_REQUEST"
  | "UPDATE_COIN_REQUEST"
  | "DELETE_COIN_REQUEST"
  | "CREATE_CALCULATION"
  | "UPDATE_CALCULATION"
  | "DELETE_CALCULATION"
  | "LOGIN"
  | "LOGOUT";

export type EntityType = "coin_request" | "calculation";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CoinRequest {
  id: string;
  user_id: string;
  request_id: string;
  who_requested: string;
  price: number;
  coin_amount: number;
  payment_status: PaymentStatus;
  send_status: SendStatus;
  payment_method: PaymentMethod | null;
  payment_method_other: string | null;
  txn_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Calculation {
  id: string;
  user_id: string;
  coin_quantity: number;
  price_per_coin: number;
  discount: number;
  additional_charge: number;
  subtotal: number;
  grand_total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: EntityType | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  totalRequests: number;
  totalCoins: number;
  totalPaid: number;
  totalDue: number;
  recentCoinRequests: CoinRequest[];
  recentCalculations: Calculation[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
