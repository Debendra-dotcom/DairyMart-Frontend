import type { SubscriptionRule } from "../types/subscription";

export const mockSubscriptionRules: SubscriptionRule[] = [
  {
    id: "sub-milk-daily",
    product: {
      id: "full-cream-milk-500",
      name: "Full Cream Milk",
      image: "/full-cream-milk-500.jpg",
    },
    quantity: 2,
    plan_type: "daily",
    start_date: "2026-04-01",
    end_date: null,
    is_active: true,
    paused_until: null,
    delivery_time: "7 AM",
  },
  {
    id: "sub-curd-custom",
    product: {
      id: "fresh-curd-400",
      name: "Fresh Curd",
      image: "/fresh-curd-400.jpg",
    },
    quantity: 1,
    plan_type: "custom_days",
    custom_days: ["Monday", "Wednesday", "Friday"],
    start_date: "2026-04-01",
    end_date: null,
    is_active: true,
    paused_until: null,
    delivery_time: "7 AM",
  },
  {
    id: "sub-paneer-weekends",
    product: {
      id: "paneer-200",
      name: "Paneer",
      image: "/paneer-200.jpg",
    },
    quantity: 1,
    plan_type: "weekends",
    start_date: "2026-04-01",
    end_date: null,
    is_active: true,
    paused_until: null,
    delivery_time: "7 AM",
  },
];
