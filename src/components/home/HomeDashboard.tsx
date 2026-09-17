import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarCheck,
  Clock,
  Copy,
  Gift,
  Headphones,
  Home,
  Minus,
  PackageCheck,
  PauseCircle,
  Plane,
  Plus,
  PlusCircle,
  Repeat,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "../../context/AuthContext";
import {
  addExtraItem,
  createSubscription,
  editSubscription,
  loadDashboard,
  loadDelivery,
  loadWalletTransactions,
  pauseSubscription,
  rechargeWallet,
  resumeDelivery,
  resumeSubscription,
  setVacation,
  skipDelivery,
  submitSupportTicket,
  updateDeliveryItemQuantity,
} from "../../services/dashboardApi";
import { addAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from "../../services/profileApi";
import type { DashboardData, DeliveryOrder, Subscription, WalletTransaction } from "../../types/dashboard";
import type { Address, AddressPayload } from "../../types/profile";
import type { Product } from "../../types/product";

type ModalName = "payment" | "transactions" | "vacation" | "address" | "subscriptions" | "support" | "referral" | "delivery" | "extra" | null;

type HomeDashboardProps = {
  onLogin?: () => void;
};

function todayKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function money(value: string | number) {
  return `₹${Number(value).toFixed(0)}`;
}

function nextCutoffCountdown(locked: boolean) {
  if (locked) return "00:00:00";
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(21, 0, 0, 0);
  const diff = Math.max(0, cutoff.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/45 px-4">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e1dccb] bg-[#fffaf0] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-[#1d2418]">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#4f7e3f]">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="sr-dashboard-card relative min-w-[210px] overflow-hidden rounded-[1.35rem] p-3.5 transition hover:-translate-y-0.5 md:min-w-0 md:p-4">
      <span className="sr-milk-swirl sr-milk-swirl-mini" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function HomeDashboard({ onLogin }: HomeDashboardProps) {
  const { isAuthLoading, isLoggedIn } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [modal, setModal] = useState<ModalName>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("00:00:00");
  const [paymentAmount, setPaymentAmount] = useState(100);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [supportType, setSupportType] = useState("missing_item");
  const [supportMessage, setSupportMessage] = useState("");
  const [vacationStart, setVacationStart] = useState(todayKey(1));
  const [vacationEnd, setVacationEnd] = useState(todayKey(3));
  const [extraProduct, setExtraProduct] = useState("");
  const [extraQuantity, setExtraQuantity] = useState(1);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setError("");
    const dashboard = await loadDashboard();
    setData(dashboard);
    const current = dashboard.calendar.find((order) => order.delivery_date === selectedDate) || dashboard.selected_delivery;
    setSelectedDelivery(current);
    setExtraProduct(dashboard.products[0]?.id || "");
  }, [isLoggedIn, selectedDate]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      setData(null);
      setSelectedDelivery(null);
      setError("");
      return;
    }
    refresh().catch((err: unknown) => setError(err instanceof Error ? err.message : "Dashboard could not load"));
  }, [isAuthLoading, isLoggedIn, refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(nextCutoffCountdown(Boolean(data?.cutoff.tomorrow_locked))), 1000);
    return () => window.clearInterval(timer);
  }, [data?.cutoff.tomorrow_locked]);

  const tomorrow = useMemo(() => data?.tomorrow_delivery, [data]);
  const activeSubscriptions = useMemo(() => data?.subscriptions.filter((item) => item.is_active) || [], [data]);
  const referralLink = data ? `${window.location.origin}/signup?ref=${data.referral.code}` : "";

  async function runAction<T>(action: () => Promise<T>, success: string, after?: (result: T) => void) {
    setBusy(true);
    try {
      const result = await action();
      after?.(result);
      await refresh();
      toast.success(success);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function chooseDate(date: string) {
    setSelectedDate(date);
    setBusy(true);
    try {
      setSelectedDelivery(await loadDelivery(date));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delivery could not load");
    } finally {
      setBusy(false);
    }
  }

  if (isAuthLoading) {
    return (
      <section className="home-dashboard-premium px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-3xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <section className="home-dashboard-premium px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#e1dccb] bg-white p-6 text-center shadow">
          <WalletCards className="mx-auto h-9 w-9 text-[#4f7e3f]" />
          <p className="mt-3 font-black text-[#1d2418]">Login to manage your dairy dashboard</p>
          <p className="mt-1 text-sm text-[#766f55]">Wallet, subscriptions, calendar, support, referrals, and address actions use your secure SR Dairy account.</p>
          <button type="button" onClick={onLogin} className="mt-4 rounded-xl bg-[#203d25] px-5 py-2.5 text-sm font-black text-white">
            Login to dashboard
          </button>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="home-dashboard-premium px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 font-black text-[#1d2418]">Dashboard is not connected</p>
          <p className="mt-1 text-sm text-[#766f55]">{error}</p>
          <button type="button" onClick={() => refresh().catch(() => undefined)} className="mt-4 rounded-xl bg-[#203d25] px-5 py-2 text-sm font-black text-white">
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!data || !selectedDelivery) {
    return (
      <section className="home-dashboard-premium px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-3xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="home-dashboard-premium relative overflow-hidden py-6 md:py-12">
      <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b7f48] md:text-sm">Home dashboard</p>
            <h2 className="mt-1 text-xl font-black text-[#1d2418] md:text-3xl">Your dairy morning, planned.</h2>
          </div>
          {data.wallet.low_balance && (
            <button type="button" onClick={() => setModal("payment")} className="rounded-full bg-[#8f4f18] px-4 py-2 text-xs font-black text-white">
              Low wallet - Recharge now
            </button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
          <div className="grid content-start gap-3">
            <section className="sr-dashboard-card sr-dashboard-card-glow relative overflow-hidden rounded-[1.7rem] p-4 md:p-5">
              <span className="sr-milk-swirl sr-milk-swirl-wallet" aria-hidden="true" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#766f55] md:text-sm">SR Wallet</p>
                  <div className="mt-1 flex items-center gap-2">
                    <WalletCards className="h-5 w-5 text-[#4f7e3f]" />
                    <p className="text-3xl font-black text-[#1d2418]">{money(data.wallet.balance)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setModal("transactions")} className="rounded-full bg-white/55 px-3 py-1 text-xs font-bold text-[#4f7e3f]">
                  History
                </button>
              </div>
              <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
                {[100, 200, 500].map((amount) => (
                  <button key={amount} type="button" onClick={() => { setPaymentAmount(amount); setModal("payment"); }} className="sr-raised-money-button rounded-xl py-3 text-sm font-black">
                    ₹{amount}
                  </button>
                ))}
              </div>
              <div className="sr-dashboard-inset relative z-10 mt-4 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-[#846220]">
                  <Clock className="h-4 w-4" />
                  <p className="text-xs font-bold md:text-sm">
                    {data.cutoff.tomorrow_locked ? "Tomorrow order locked" : `Order within ${countdown} for 7 AM delivery`}
                  </p>
                </div>
              </div>
              <div className="sr-dashboard-inset relative z-10 mt-3 flex items-center justify-between gap-3 rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#4f7e3f]">
                    <Plane className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#1d2418]">Vacation mode</p>
                    <p className="text-xs text-[#766f55]">{data.vacation ? `${data.vacation.start_date} to ${data.vacation.end_date}` : "Pause doorstep delivery"}</p>
                  </div>
                </div>
                <button type="button" onClick={() => data.vacation ? runAction(() => setVacation(false), "Vacation mode disabled") : setModal("vacation")} className={`sr-vacation-toggle h-8 w-14 rounded-full p-1 shadow-inner ${data.vacation ? "is-active bg-gradient-to-r from-[#25452a] to-[#735528]" : "bg-[#d7dbd0]"}`}>
                  <span className={`sr-vacation-toggle-knob block h-6 w-6 rounded-full bg-white shadow-sm ${data.vacation ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </section>

            <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0">
              <MiniCard>
                <div className="flex items-start gap-2.5">
                  <span className="sr-mini-icon"><PackageCheck className="h-5 w-5" /></span>
                  <button type="button" onClick={() => setModal("delivery")} className="min-w-0 flex-1 text-left">
                    <h3 className="text-sm font-black text-[#1d2418]">Next delivery</h3>
                    <p className="mt-1 text-xs text-[#766f55]">{data.next_delivery ? formatDate(data.next_delivery.delivery_date) : "No delivery"}</p>
                    <p className="mt-2 text-sm font-black text-[#1d2418]">{data.next_delivery?.items.length || 0} items scheduled</p>
                  </button>
                </div>
              </MiniCard>
              <MiniCard>
                <div className="flex items-start gap-2.5">
                  <span className="sr-mini-icon"><Home className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-[#1d2418]">Default address</h3>
                    <p className="mt-1 truncate text-xs text-[#766f55]">{data.default_address ? `${data.default_address.house_flat}, ${data.default_address.area}` : "Add your home address"}</p>
                    <button type="button" onClick={() => setModal("address")} className="mt-2 text-xs font-black text-[#4f7e3f]">Change</button>
                  </div>
                </div>
              </MiniCard>
              <MiniCard>
                <div className="flex items-start gap-2.5">
                  <span className="sr-mini-icon"><Repeat className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-[#1d2418]">Daily Milk Plan</h3>
                    <p className="mt-1 text-xs text-[#766f55]">{activeSubscriptions.length} active products</p>
                    <button type="button" onClick={() => setModal("subscriptions")} className="mt-2 text-xs font-black text-[#4f7e3f]">Manage</button>
                  </div>
                </div>
              </MiniCard>
              <MiniCard>
                <div className="flex items-start gap-2.5">
                  <span className="sr-mini-icon"><Headphones className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-[#1d2418]">Quick support</h3>
                    <p className="mt-1 text-xs text-[#766f55]">Missing item - Late delivery</p>
                    <button type="button" onClick={() => setModal("support")} className="mt-2 text-xs font-black text-[#4f7e3f]">Help</button>
                  </div>
                </div>
              </MiniCard>
              <MiniCard>
                <div className="flex items-start gap-2.5">
                  <span className="sr-mini-icon text-[#8a6400]"><Gift className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-[#1d2418]">Invite a friend</h3>
                    <p className="mt-1 text-xs text-[#766f55]">Earn {money(data.referral.reward_amount)}</p>
                    <button type="button" onClick={() => setModal("referral")} className="mt-2 text-xs font-black text-[#4f7e3f]">Invite</button>
                  </div>
                </div>
              </MiniCard>
            </div>
          </div>

          <div className="grid gap-3">
            <section className="sr-dashboard-card relative overflow-hidden rounded-[1.5rem] p-4">
              <div className="relative z-10 flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-[#1d2418]">Daily delivery calendar</h3>
                <button type="button" disabled={data.cutoff.tomorrow_locked} onClick={() => chooseDate(todayKey(1))} className="sr-primary-dashboard-button rounded-xl px-4 py-2 text-xs font-black text-white disabled:opacity-50">
                  Modify tomorrow order
                </button>
              </div>
              <div className="relative z-10 mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {data.calendar.slice(0, 14).map((order) => {
                  const active = order.delivery_date === selectedDate;
                  const status = order.is_locked ? "locked" : order.status;
                  return (
                    <button key={order.id} type="button" onClick={() => chooseDate(order.delivery_date)} className={`${active ? "sr-calendar-day-active" : "sr-calendar-day"} rounded-2xl p-2 text-left`}>
                      <p className="text-xs font-black text-[#1d2418]">{formatDate(order.delivery_date)}</p>
                      <p className="mt-1 text-[10px] font-bold capitalize text-[#766f55]">{status}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="sr-dashboard-card sr-selected-delivery-card relative overflow-hidden rounded-[1.5rem] p-4">
              <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-[#1d2418] md:text-base">Selected day delivery</h3>
                  <p className="text-xs text-[#766f55]">{formatDate(selectedDelivery.delivery_date)}</p>
                </div>
                <CalendarCheck className="h-5 w-5 text-[#4f7e3f]" />
              </div>
              {selectedDelivery.items.length === 0 || selectedDelivery.is_skipped ? (
                <div className="sr-dashboard-inset rounded-2xl p-4 text-center">
                  <p className="font-black text-[#1d2418]">{selectedDelivery.is_skipped ? "Delivery skipped" : "No delivery scheduled"}</p>
                  <button type="button" onClick={() => runAction(() => resumeDelivery(selectedDelivery.delivery_date), "Delivery resumed")} className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#4f7e3f]">
                    Resume
                  </button>
                </div>
              ) : (
                <div className="grid gap-2">
                  {selectedDelivery.items.map((item) => (
                    <article key={item.id} className="sr-dashboard-inset rounded-2xl p-3">
                      <div className="flex items-center gap-3">
                        <img src={`/${item.product.image}`} alt={item.product.name} className="h-12 w-12 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-[#1d2418]">{item.product.name}</p>
                          <p className="text-xs text-[#766f55]">Qty {item.quantity} - {selectedDelivery.delivery_time} - {item.status}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" disabled={selectedDelivery.is_locked || busy} onClick={() => runAction(() => updateDeliveryItemQuantity(item.id, Math.max(0, item.quantity - 1)), "Quantity updated")} className="sr-stepper-button rounded-full bg-white/70 p-2 text-[#4f7e3f] disabled:opacity-40">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-black">{item.quantity}</span>
                        <button type="button" disabled={selectedDelivery.is_locked || busy} onClick={() => runAction(() => updateDeliveryItemQuantity(item.id, item.quantity + 1), "Quantity updated")} className="sr-stepper-button rounded-full bg-white/70 p-2 text-[#4f7e3f] disabled:opacity-40">
                          <Plus className="h-4 w-4" />
                        </button>
                        <button type="button" disabled={selectedDelivery.is_locked || busy} onClick={() => window.confirm("Skip this delivery day?") && runAction(() => skipDelivery(selectedDelivery.delivery_date), "Delivery skipped")} className="ml-auto rounded-xl bg-white/70 px-3 py-2 text-xs font-black text-[#4f7e3f] disabled:opacity-40">
                          Skip this day
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="sr-dashboard-inset mt-3 rounded-2xl p-3">
                <p className="text-xs font-black uppercase text-[#766f55]">Tomorrow preview</p>
                {(tomorrow?.items.length || 0) === 0 ? <p className="mt-2 text-sm text-[#766f55]">No order tomorrow.</p> : tomorrow?.items.map((item) => (
                  <div key={item.id} className="mt-2 flex items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-[#1d2418]">{item.product.name}</span>
                    <span className="text-[#766f55]">Qty {item.quantity}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="sr-dashboard-card relative overflow-hidden rounded-[1.5rem] p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button type="button" disabled={selectedDelivery.is_locked || busy} onClick={() => window.confirm("Skip this delivery day?") && runAction(() => skipDelivery(selectedDelivery.delivery_date), "Delivery skipped")} className="sr-soft-pill-action rounded-xl px-2 py-3 text-center disabled:opacity-50"><Ban className="mx-auto h-5 w-5 text-[#4f7e3f]" /><span className="mt-2 block text-xs font-black">Skip this day</span></button>
                <button type="button" disabled={data.cutoff.tomorrow_locked || busy} onClick={() => runAction(() => skipDelivery(todayKey(1)), "Tomorrow paused")} className="sr-soft-pill-action rounded-xl px-2 py-3 text-center disabled:opacity-50"><PauseCircle className="mx-auto h-5 w-5 text-[#4f7e3f]" /><span className="mt-2 block text-xs font-black">Pause tomorrow</span></button>
                <button type="button" disabled={busy} onClick={() => runAction(() => resumeDelivery(selectedDelivery.delivery_date), "Delivery resumed")} className="sr-soft-pill-action rounded-xl px-2 py-3 text-center"><Repeat className="mx-auto h-5 w-5 text-[#4f7e3f]" /><span className="mt-2 block text-xs font-black">Resume</span></button>
                <button type="button" disabled={selectedDelivery.is_locked || busy} onClick={() => setModal("extra")} className="sr-soft-pill-action rounded-xl px-2 py-3 text-center disabled:opacity-50"><PlusCircle className="mx-auto h-5 w-5 text-[#4f7e3f]" /><span className="mt-2 block text-xs font-black">Add extra items</span></button>
              </div>
            </section>

            <section className="sr-dashboard-card relative overflow-hidden rounded-[1.5rem] p-4">
              <h3 className="text-base font-black text-[#1d2418]">Active subscription summary</h3>
              <div className="mt-3 grid gap-2">
                {data.subscriptions.map((item) => (
                  <button key={item.id} type="button" onClick={() => setModal("subscriptions")} className="sr-dashboard-inset rounded-xl p-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-[#1d2418]">{item.product.name}</p>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black capitalize text-[#4f7e3f]">{item.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#766f55]">Qty {item.quantity} - {item.delivery_time} - {item.frequency}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => activeSubscriptions[0] && runAction(() => pauseSubscription(activeSubscriptions[0].id, todayKey(1)), "Subscription paused")} className="sr-soft-pill-action rounded-xl py-2.5 text-xs font-black text-[#4f7e3f]">Pause tomorrow</button>
                <button type="button" onClick={() => Promise.all(data.subscriptions.map((item) => resumeSubscription(item.id))).then(() => refresh()).then(() => toast.success("Subscriptions resumed"))} className="sr-primary-dashboard-button rounded-xl py-2.5 text-xs font-black text-white">Resume subscription</button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {modal === "payment" && (
        <Modal title="Recharge wallet" onClose={() => setModal(null)}>
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((amount) => <button key={amount} type="button" onClick={() => setPaymentAmount(amount)} className={`rounded-xl px-4 py-3 text-sm font-black ${paymentAmount === amount ? "bg-[#203d25] text-white" : "bg-white text-[#4f7e3f]"}`}>₹{amount}</button>)}
          </div>
          <button disabled={busy} type="button" onClick={() => runAction(() => rechargeWallet(paymentAmount), "Payment successful", () => setModal(null))} className="mt-4 w-full rounded-xl bg-[#203d25] py-3 font-black text-white disabled:opacity-60">
            {busy ? "Processing payment..." : `Pay ₹${paymentAmount}`}
          </button>
        </Modal>
      )}

      {modal === "transactions" && (
        <Modal title="Wallet transactions" onClose={() => setModal(null)}>
          <button type="button" onClick={() => loadWalletTransactions().then(setTransactions).catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not load transactions"))} className="mb-3 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#4f7e3f]">Load history</button>
          <div className="grid gap-2">
            {transactions.map((item) => <div key={item.id} className="rounded-xl bg-white p-3 text-sm"><b>{money(item.amount)}</b> {item.transaction_type} - {item.reason}<p className="text-xs text-[#766f55]">{item.reference}</p></div>)}
          </div>
        </Modal>
      )}

      {modal === "vacation" && (
        <Modal title="Vacation mode" onClose={() => setModal(null)}>
          <div className="grid gap-3">
            <input type="date" value={vacationStart} onChange={(event) => setVacationStart(event.target.value)} className="rounded-xl border p-3" />
            <input type="date" value={vacationEnd} onChange={(event) => setVacationEnd(event.target.value)} className="rounded-xl border p-3" />
            <button type="button" onClick={() => runAction(() => setVacation(true, vacationStart, vacationEnd), "Vacation mode enabled", () => setModal(null))} className="rounded-xl bg-[#203d25] py-3 font-black text-white">Pause deliveries</button>
          </div>
        </Modal>
      )}

      {modal === "support" && (
        <Modal title="Quick support" onClose={() => setModal(null)}>
          <select value={supportType} onChange={(event) => setSupportType(event.target.value)} className="w-full rounded-xl border p-3">
            <option value="missing_item">Missing item</option><option value="late_delivery">Late delivery</option><option value="payment_issue">Payment issue</option><option value="quality_issue">Quality issue</option><option value="other">Other</option>
          </select>
          <textarea value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Tell us what happened" className="mt-3 min-h-28 w-full rounded-xl border p-3" />
          <button type="button" onClick={() => runAction(() => submitSupportTicket(supportType, supportMessage), "Support ticket created", () => { setSupportMessage(""); setModal(null); })} className="mt-3 w-full rounded-xl bg-[#203d25] py-3 font-black text-white">Submit ticket</button>
        </Modal>
      )}

      {modal === "referral" && (
        <Modal title="Invite a friend" onClose={() => setModal(null)}>
          <p className="rounded-xl bg-white p-3 text-sm font-bold text-[#1d2418]">{referralLink}</p>
          <button type="button" onClick={() => navigator.clipboard.writeText(referralLink).then(() => toast.success("Referral link copied"))} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#203d25] px-4 py-3 font-black text-white"><Copy className="h-4 w-4" /> Copy link</button>
        </Modal>
      )}

      {modal === "extra" && (
        <Modal title="Add extra items" onClose={() => setModal(null)}>
          <select value={extraProduct} onChange={(event) => setExtraProduct(event.target.value)} className="w-full rounded-xl border p-3">
            {data.products.map((product: Product) => <option key={product.id} value={product.id}>{product.name} - {product.variant} - ₹{product.price}</option>)}
          </select>
          <input type="number" min={1} value={extraQuantity} onChange={(event) => setExtraQuantity(Number(event.target.value))} className="mt-3 w-full rounded-xl border p-3" />
          <button type="button" onClick={() => runAction(() => addExtraItem(selectedDelivery.delivery_date, extraProduct, extraQuantity), "Extra item added", () => setModal(null))} className="mt-3 w-full rounded-xl bg-[#203d25] py-3 font-black text-white">Add to selected day</button>
        </Modal>
      )}

      {modal === "subscriptions" && <SubscriptionModal subscriptions={data.subscriptions} products={data.products} onClose={() => setModal(null)} onRefresh={refresh} />}
      {modal === "address" && <AddressModal onClose={() => setModal(null)} onRefresh={refresh} />}
      {modal === "delivery" && <Modal title="Next delivery details" onClose={() => setModal(null)}><pre className="whitespace-pre-wrap rounded-xl bg-white p-3 text-xs">{JSON.stringify(data.next_delivery, null, 2)}</pre></Modal>}
    </section>
  );
}

const emptyAddress: AddressPayload = {
  house_flat: "",
  area: "",
  landmark: "",
  city: "",
  pincode: "",
  delivery_instruction: "",
  leave_at_door: false,
  is_default: false,
};

function AddressModal({ onClose, onRefresh }: { onClose: () => void; onRefresh: () => Promise<void> }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressPayload>(emptyAddress);

  const load = useCallback(() => {
    getAddresses().then(setAddresses).catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not load addresses"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!form.house_flat.trim() || !form.area.trim() || !form.city.trim() || !form.pincode.trim()) {
      toast.warning("House, area, city, and pincode are required");
      return;
    }
    if (editingId) {
      await updateAddress(editingId, form);
      toast.success("Address updated");
    } else {
      await addAddress(form);
      toast.success("Address added");
    }
    setEditingId(null);
    setForm(emptyAddress);
    load();
    await onRefresh();
  }

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      house_flat: address.house_flat,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      pincode: address.pincode,
      delivery_instruction: address.delivery_instruction,
      leave_at_door: address.leave_at_door,
      is_default: address.is_default,
    });
  }

  return (
    <Modal title="Address management" onClose={onClose}>
      <div className="grid gap-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-xl bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#1d2418]">{address.house_flat}, {address.area}</p>
                <p className="text-xs text-[#766f55]">{address.city} - {address.pincode}</p>
                {address.is_default && <span className="mt-2 inline-block rounded-full bg-[#eef8ea] px-2 py-1 text-[10px] font-black text-[#4f7e3f]">Default</span>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => startEdit(address)} className="rounded-lg bg-[#eef8ea] px-2 py-1 text-xs font-black text-[#4f7e3f]">Edit</button>
                <button type="button" onClick={() => setDefaultAddress(address.id).then(() => onRefresh()).then(load).then(() => toast.success("Default address updated"))} className="rounded-lg bg-[#eef8ea] px-2 py-1 text-xs font-black text-[#4f7e3f]">Default</button>
                <button type="button" onClick={() => window.confirm("Delete this address?") && deleteAddress(address.id).then(() => onRefresh()).then(load).then(() => toast.success("Address deleted"))} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-black text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 rounded-xl bg-white p-3">
        <p className="text-sm font-black">{editingId ? "Edit address" : "Add address"}</p>
        <input value={form.house_flat} onChange={(event) => setForm({ ...form, house_flat: event.target.value })} placeholder="House / flat" className="rounded-xl border p-3" />
        <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="Area" className="rounded-xl border p-3" />
        <input value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} placeholder="Landmark" className="rounded-xl border p-3" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" className="rounded-xl border p-3" />
          <input value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} placeholder="Pincode" className="rounded-xl border p-3" />
        </div>
        <textarea value={form.delivery_instruction} onChange={(event) => setForm({ ...form, delivery_instruction: event.target.value })} placeholder="Delivery instruction" className="min-h-20 rounded-xl border p-3" />
        <label className="flex items-center gap-2 text-sm font-bold text-[#1d2418]">
          <input type="checkbox" checked={form.leave_at_door} onChange={(event) => setForm({ ...form, leave_at_door: event.target.checked })} />
          Leave at door
        </label>
        <button type="button" onClick={save} className="rounded-xl bg-[#203d25] py-3 font-black text-white">{editingId ? "Save address" : "Add address"}</button>
      </div>
    </Modal>
  );
}

function SubscriptionModal({ subscriptions, products, onClose, onRefresh }: { subscriptions: Subscription[]; products: Product[]; onClose: () => void; onRefresh: () => Promise<void> }) {
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);

  async function saveCreate() {
    await createSubscription({ product_id: productId, quantity, frequency: "daily", delivery_time: "7:00 AM" });
    await onRefresh();
    toast.success("Subscription created");
  }

  return (
    <Modal title="Manage subscriptions" onClose={onClose}>
      <div className="grid gap-2">
        {subscriptions.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-3">
            <p className="font-black text-[#1d2418]">{item.product.name}</p>
            <p className="text-xs text-[#766f55]">Qty {item.quantity} - {item.frequency} - {item.status}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => editSubscription(item.id, { quantity: item.quantity + 1 }).then(onRefresh).then(() => toast.success("Subscription updated"))} className="rounded-lg bg-[#eef8ea] px-3 py-2 text-xs font-black text-[#4f7e3f]">+ Qty</button>
              <button type="button" onClick={() => pauseSubscription(item.id).then(onRefresh).then(() => toast.success("Subscription paused"))} className="rounded-lg bg-[#fff4df] px-3 py-2 text-xs font-black text-[#8a6400]">Pause</button>
              <button type="button" onClick={() => resumeSubscription(item.id).then(onRefresh).then(() => toast.success("Subscription resumed"))} className="rounded-lg bg-[#eef8ea] px-3 py-2 text-xs font-black text-[#4f7e3f]">Resume</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-white p-3">
        <p className="mb-2 text-sm font-black">Add product</p>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className="w-full rounded-xl border p-3">
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} - {product.variant}</option>)}
        </select>
        <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-2 w-full rounded-xl border p-3" />
        <button type="button" onClick={saveCreate} className="mt-2 w-full rounded-xl bg-[#203d25] py-3 font-black text-white">Create subscription</button>
      </div>
    </Modal>
  );
}
