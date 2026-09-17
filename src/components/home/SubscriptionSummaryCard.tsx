import { CalendarClock } from "lucide-react";

type SubscriptionSummaryCardProps = {
  onPause: () => void;
  onModify: () => void;
};

export default function SubscriptionSummaryCard({ onPause, onModify }: SubscriptionSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-[#dfe8d7] bg-gradient-to-br from-[#f7fbf4] to-white p-4 shadow-[0_12px_36px_rgba(34,45,31,0.07)] transition hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2f6b3f] shadow-sm">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#152015]">Subscription summary</h3>
            <span className="rounded-full bg-[#2f6b3f] px-2 py-0.5 text-[10px] font-bold text-white">Active</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white p-3">
              <p className="text-[11px] font-bold uppercase text-[#6a735f]">Plan</p>
              <p className="mt-1 font-bold text-[#152015]">Daily</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-[11px] font-bold uppercase text-[#6a735f]">Next delivery</p>
              <p className="mt-1 font-bold text-[#152015]">Tomorrow, 7 AM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPause}
          className="rounded-xl border border-[#dfe8d7] bg-white py-2.5 text-xs font-bold text-[#2f6b3f] transition hover:bg-[#eef8ea]"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={onModify}
          className="rounded-xl bg-[#152015] py-2.5 text-xs font-bold text-white transition hover:bg-[#2f6b3f]"
        >
          Modify
        </button>
      </div>
    </section>
  );
}
