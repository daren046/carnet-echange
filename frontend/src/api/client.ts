import axios from "axios";
import type {
  ApiResponse,
  AppNotification,
  AuthResponse,
  BookCopy,
  Delivery,
  ImpactStats,
  LibraryLoan,
  MobileMoneyProvider,
  Order,
  SchoolLevel,
  Subject,
  Transaction,
  UserMe,
  Zone,
  BookCondition,
  UserRole,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      localStorage.removeItem("accessToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
  return data;
}

export async function register(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  schoolLevel?: string;
  zoneCode: string;
}) {
  const { data } = await api.post<ApiResponse<UserMe>>("/auth/register", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<UserMe>>("/auth/me");
  return data;
}

export async function updateProfile(payload: {
  firstName: string;
  lastName: string;
  schoolLevel?: SchoolLevel | null;
  zoneCode: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const { data } = await api.put<ApiResponse<UserMe>>("/auth/me", payload);
  return data;
}

export async function getNotifications() {
  const { data } = await api.get<ApiResponse<AppNotification[]>>("/notifications");
  return data;
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
  return data;
}

export async function markNotificationRead(id: number) {
  const { data } = await api.post<ApiResponse<null>>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post<ApiResponse<null>>("/notifications/read-all");
  return data;
}

export async function getImpactStats() {
  const { data } = await api.get<ApiResponse<ImpactStats>>("/stats");
  return data;
}

export async function getZones() {
  const { data } = await api.get<ApiResponse<Zone[]>>("/zones");
  return data;
}

export async function searchBooks(params?: {
  level?: SchoolLevel;
  subject?: Subject;
  libraryMode?: boolean;
  zoneId?: number;
  title?: string;
}) {
  const { data } = await api.get<ApiResponse<BookCopy[]>>("/books", { params });
  return data;
}

export async function depositBook(form: FormData) {
  const { data } = await api.post<ApiResponse<BookCopy>>("/books/deposit", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getMyDeposits() {
  const { data } = await api.get<ApiResponse<BookCopy[]>>("/books/mine");
  return data;
}

export async function reserveBook(bookCopyId: number) {
  const { data } = await api.post<ApiResponse<Delivery>>(`/deliveries/reserve/${bookCopyId}`);
  return data;
}

export async function getTransactions() {
  const { data } = await api.get<ApiResponse<Transaction[]>>("/transactions");
  return data;
}

export async function getPendingDeliveries() {
  const { data } = await api.get<ApiResponse<Delivery[]>>("/deliveries/pending");
  return data;
}

export async function assignDelivery(deliveryId: number) {
  const { data } = await api.post<ApiResponse<Delivery>>(`/deliveries/${deliveryId}/assign`);
  return data;
}

export async function markDelivered(deliveryId: number) {
  const { data } = await api.post<ApiResponse<Delivery>>(`/deliveries/${deliveryId}/delivered`);
  return data;
}

export async function getLibraryBooks() {
  const { data } = await api.get<ApiResponse<BookCopy[]>>("/library");
  return data;
}

export async function borrowLibraryBook(bookCopyId: number) {
  const { data } = await api.post<ApiResponse<LibraryLoan>>(`/library/borrow/${bookCopyId}`);
  return data;
}

export async function returnLibraryBook(loanId: number) {
  const { data } = await api.post<ApiResponse<LibraryLoan>>(`/library/return/${loanId}`);
  return data;
}

export async function getMyLoans() {
  const { data } = await api.get<ApiResponse<LibraryLoan[]>>("/library/loans");
  return data;
}

export async function getLibraryDepositAmount() {
  const { data } = await api.get<ApiResponse<{ amount: number }>>("/library/deposit-amount");
  return data;
}

export async function getMyOrders() {
  const { data } = await api.get<ApiResponse<Order[]>>("/deliveries/orders");
  return data;
}

export async function cancelOrder(reservationId: number) {
  const { data } = await api.post<ApiResponse<Order>>(`/deliveries/orders/${reservationId}/cancel`);
  return data;
}

export async function getWalletBalance() {
  const { data } = await api.get<ApiResponse<{ balance: number }>>("/wallet");
  return data;
}

export async function topUpWallet(payload: {
  provider: MobileMoneyProvider;
  phoneNumber: string;
  amount: number;
}) {
  const { data } = await api.post<ApiResponse<{ balance: number }>>("/wallet/topup", payload);
  return data;
}

export type { BookCondition };
