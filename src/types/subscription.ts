export type PlanType = "daily" | "alternate" | "custom_days" | "weekends" | "monthly";

export type DeliveryStatus = "scheduled" | "skipped" | "paused" | "modified" | "delivered" | "failed";

export type WeekdayName = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export interface SubscriptionProduct {
  id: string;
  name: string;
  image: string;
}

export interface SubscriptionRule {
  id: string;
  product: SubscriptionProduct;
  quantity: number;
  plan_type: PlanType;
  custom_days?: WeekdayName[];
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  paused_until?: string | null;
  delivery_time: string;
}

export interface DailyDeliveryLog {
  id: string;
  subscription_id: string;
  delivery_date: string;
  product: SubscriptionProduct;
  quantity: number;
  status: DeliveryStatus;
  temporary_quantity?: number | null;
  note?: string;
  delivery_time: string;
}
