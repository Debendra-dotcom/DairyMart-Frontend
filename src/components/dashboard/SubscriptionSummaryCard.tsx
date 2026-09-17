import { CalendarClock } from "lucide-react";
import type { SubscriptionRule } from "../../types/subscription";

type SubscriptionSummaryCardProps = {
  rules: SubscriptionRule[];
  onPauseTomorrow: () => void;
  onResume: () => void;
};

function planLabel(planType: SubscriptionRule["plan_type"]) {
  return planType.replace("_", " ");
}

export default function SubscriptionSummaryCard({ rules, onPauseTomorrow, onResume }: SubscriptionSummaryCardProps) {
  const activeRules = rules.filter((rule) => rule.is_active);

  return (
    <section className="sr-dashboard-card relative overflow-hidden rounded-[1.5rem] p-4">
      <span className="sr-milk-swirl sr-milk-swirl-summary" aria-hidden="true" />
      <span className="sr-leaf-accent right-8 top-7" aria-hidden="true" />
      <div className="relative z-10 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/65 text-[#4f7e3f] shadow-[0_10px_18px_rgba(58,78,43,0.12)]">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-[#1d2418]">Active subscription summary</h3>
            <span className="rounded-full bg-gradient-to-r from-[#25452a] to-[#735528] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(58,78,43,0.16)]">
              {activeRules.length} active
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {activeRules.map((rule) => (
              <div key={rule.id} className="sr-dashboard-inset rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-[#1d2418]">{rule.product.name}</p>
                  <p className="text-xs font-black capitalize text-[#4f7e3f]">{planLabel(rule.plan_type)}</p>
                </div>
                <p className="mt-1 text-xs text-[#766f55]">
                  Qty {rule.quantity} - Next delivery {rule.delivery_time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPauseTomorrow}
          className="sr-soft-pill-action rounded-xl py-2.5 text-xs font-black text-[#4f7e3f] transition hover:-translate-y-0.5"
        >
          Pause tomorrow
        </button>
        <button
          type="button"
          onClick={onResume}
          className="sr-primary-dashboard-button rounded-xl py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5"
        >
          Resume subscription
        </button>
      </div>
    </section>
  );
}
