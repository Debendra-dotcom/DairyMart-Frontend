import { getAccessToken } from "./profileApi";
import type { DashboardData, DeliveryOrder, Subscription, WalletTransaction } from "../types/dashboard";

const API_BASE = "http://127.0.0.1:8000/api/dashboard";

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error && typeof data.error === "object"
          ? Object.values(data.error).flat().join(" ") || "Request failed"
          : typeof data.detail === "string"
            ? data.detail
          : "Request failed";
    throw new Error(message);
  }
  return data;
}

function post<T>(path: string, payload?: unknown) {
  return fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload || {}),
  }).then((response) => parseResponse<T>(response));
}

function put<T>(path: string, payload?: unknown) {
  return fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload || {}),
  }).then((response) => parseResponse<T>(response));
}

export function loadDashboard() {
  return fetch(`${API_BASE}/`, { headers: authHeaders() }).then((response) => parseResponse<DashboardData>(response));
}

export function rechargeWallet(amount: number) {
  return post<{ wallet: { balance: string }; transaction: WalletTransaction }>("/wallet/recharge/", { amount });
}

export function loadWalletTransactions() {
  return fetch(`${API_BASE}/wallet/transactions/`, { headers: authHeaders() }).then((response) => parseResponse<WalletTransaction[]>(response));
}

export function loadDelivery(date: string) {
  return fetch(`${API_BASE}/deliveries/${date}/`, { headers: authHeaders() }).then((response) => parseResponse<DeliveryOrder>(response));
}

export function updateDeliveryItemQuantity(itemId: number, quantity: number) {
  return post<DeliveryOrder>(`/delivery-items/${itemId}/quantity/`, { quantity });
}

export function skipDelivery(date: string) {
  return post<DeliveryOrder>(`/deliveries/${date}/skip/`);
}

export function resumeDelivery(date: string) {
  return post<DeliveryOrder>(`/deliveries/${date}/resume/`);
}

export function addExtraItem(date: string, productId: string, quantity: number) {
  return post<DeliveryOrder>(`/deliveries/${date}/extra/`, { product_id: productId, quantity });
}

export function createSubscription(payload: { product_id: string; quantity: number; frequency: string; delivery_time: string }) {
  return post<Subscription>("/subscriptions/create/", payload);
}

export function editSubscription(id: number, payload: { quantity?: number; frequency?: string; delivery_time?: string }) {
  return put<Subscription>(`/subscriptions/${id}/edit/`, payload);
}

export function pauseSubscription(id: number, pausedUntil?: string) {
  return post<Subscription>(`/subscriptions/${id}/pause/`, pausedUntil ? { paused_until: pausedUntil } : {});
}

export function resumeSubscription(id: number) {
  return post<Subscription>(`/subscriptions/${id}/resume/`);
}

export function setVacation(enabled: boolean, startDate?: string, endDate?: string) {
  return post<{ vacation: DashboardData["vacation"] }>("/vacation/", { enabled, start_date: startDate, end_date: endDate });
}

export function submitSupportTicket(issueType: string, message: string) {
  return post<{ ticket_id: string; issue_type: string; message: string; status: string }>("/support/", { issue_type: issueType, message });
}
