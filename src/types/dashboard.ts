import type { Address, Profile } from "./profile";
import type { Product } from "./product";

export type DeliveryStatus = "ordered" | "modified" | "skipped" | "delivered" | "locked" | string;

export type DashboardWallet = {
  balance: string;
  low_balance: boolean;
};

export type WalletTransaction = {
  id: number;
  amount: string;
  transaction_type: "credit" | "debit";
  status: string;
  reason: string;
  reference: string;
  created_at: string;
};

export type Subscription = {
  id: number;
  product: Product;
  quantity: number;
  frequency: string;
  delivery_time: string;
  status: string;
  is_active: boolean;
  paused_until: string | null;
  created_at: string;
};

export type DeliveryItem = {
  id: number;
  product: Product;
  subscription: number | null;
  quantity: number;
  is_extra: boolean;
  status: string;
};

export type DeliveryOrder = {
  id: number;
  delivery_date: string;
  status: DeliveryStatus;
  is_locked: boolean;
  is_skipped: boolean;
  delivery_time: string;
  wallet_debited: boolean;
  items: DeliveryItem[];
};

export type VacationPause = {
  id: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

export type Referral = {
  code: string;
  reward_amount: string;
  created_at: string;
};

export type DashboardNotification = {
  id: number;
  title: string;
  message: string;
  level: string;
  is_read: boolean;
  created_at: string;
};

export type DashboardData = {
  profile: Profile;
  wallet: DashboardWallet;
  cutoff: { time: string; tomorrow_locked: boolean; message: string };
  default_address: Address | null;
  products: Product[];
  subscriptions: Subscription[];
  calendar: DeliveryOrder[];
  selected_delivery: DeliveryOrder;
  tomorrow_delivery: DeliveryOrder;
  next_delivery: DeliveryOrder | null;
  vacation: VacationPause | null;
  referral: Referral;
  notifications: DashboardNotification[];
};
