import type { DailyDeliveryLog } from "../types/subscription";
import { getCurrentAuthUserId } from "../services/authStorage";
import { toDateKey } from "./subscriptionEngine";

const deliveryLogKey = "sr_delivery_log_overrides";

function getDeliveryLogKey() {
  return `${deliveryLogKey}:${getCurrentAuthUserId() || "guest"}`;
}

function readOverrides(): DailyDeliveryLog[] {
  const stored = localStorage.getItem(getDeliveryLogKey());
  return stored ? (JSON.parse(stored) as DailyDeliveryLog[]) : [];
}

function writeOverrides(logs: DailyDeliveryLog[]) {
  localStorage.setItem(getDeliveryLogKey(), JSON.stringify(logs));
}

function upsertLog(log: DailyDeliveryLog) {
  const logs = readOverrides();
  const index = logs.findIndex((item) => item.subscription_id === log.subscription_id && item.delivery_date === log.delivery_date);

  if (index >= 0) {
    logs[index] = { ...logs[index], ...log };
  } else {
    logs.push(log);
  }

  writeOverrides(logs);
}

function patchLog(date: string, subscriptionId: string, patch: Partial<DailyDeliveryLog>) {
  const logs = readOverrides();
  const index = logs.findIndex((item) => item.subscription_id === subscriptionId && item.delivery_date === date);

  if (index >= 0) {
    logs[index] = { ...logs[index], ...patch };
    writeOverrides(logs);
  }
}

export function mergeDeliveryLogs(baseLogs: DailyDeliveryLog[]) {
  const overrides = readOverrides();

  return baseLogs.map((log) => {
    const override = overrides.find((item) => item.subscription_id === log.subscription_id && item.delivery_date === log.delivery_date);
    return override ? { ...log, ...override } : log;
  });
}

export function skipDelivery(date: string, subscriptionId: string) {
  patchLog(date, subscriptionId, {
    status: "skipped",
    note: "Skipped by customer",
  });
}

export function pauseTomorrow(subscriptionId: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = toDateKey(tomorrow);
  patchLog(date, subscriptionId, {
    status: "paused",
    note: "Paused for tomorrow",
  });
}

export function changeQuantityForDate(date: string, subscriptionId: string, quantity: number) {
  patchLog(date, subscriptionId, {
    status: "modified",
    temporary_quantity: quantity,
    note: `Quantity changed to ${quantity}`,
  });
}

export function resumeSubscription(subscriptionId: string) {
  const logs = readOverrides().filter((log) => !(log.subscription_id === subscriptionId && log.status === "paused"));
  writeOverrides(logs);
}

export function ensureStoredDeliveryLog(log: DailyDeliveryLog) {
  upsertLog(log);
}
