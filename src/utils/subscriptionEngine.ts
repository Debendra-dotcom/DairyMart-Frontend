import type { DailyDeliveryLog, SubscriptionRule, WeekdayName } from "../types/subscription";

const weekdayNames: WeekdayName[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(start: Date, end: Date) {
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.floor((endTime - startTime) / 86_400_000);
}

export function isDeliveryDay(rule: SubscriptionRule, date: Date) {
  if (!rule.is_active) return false;

  const dateKey = toDateKey(date);
  if (dateKey < rule.start_date) return false;
  if (rule.end_date && dateKey > rule.end_date) return false;

  if (rule.paused_until && dateKey <= rule.paused_until) return true;

  const weekday = weekdayNames[date.getDay()];

  switch (rule.plan_type) {
    case "daily":
      return true;
    case "alternate":
      return daysBetween(parseDateKey(rule.start_date), date) % 2 === 0;
    case "custom_days":
      return Boolean(rule.custom_days?.includes(weekday));
    case "weekends":
      return weekday === "Saturday" || weekday === "Sunday";
    case "monthly":
      return date.getDate() === parseDateKey(rule.start_date).getDate();
    default:
      return false;
  }
}

export function generateDeliveryLogs(subscriptionRules: SubscriptionRule[], startDate: Date, days: number): DailyDeliveryLog[] {
  const logs: DailyDeliveryLog[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(startDate.getDate() + offset);
    const deliveryDateKey = toDateKey(deliveryDate);

    subscriptionRules.forEach((rule) => {
      if (!isDeliveryDay(rule, deliveryDate)) return;

      logs.push({
        id: `${rule.id}-${deliveryDateKey}`,
        subscription_id: rule.id,
        delivery_date: deliveryDateKey,
        product: rule.product,
        quantity: rule.quantity,
        status: rule.paused_until && deliveryDateKey <= rule.paused_until ? "paused" : "scheduled",
        temporary_quantity: null,
        note: "",
        delivery_time: rule.delivery_time,
      });
    });
  }

  return logs;
}
