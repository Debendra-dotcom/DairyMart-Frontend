import { CalendarCheck, Minus, Plus } from "lucide-react";
import type { DailyDeliveryLog } from "../../types/subscription";

type DeliveryDayDetailsProps = {
  selectedDate: string;
  selectedLogs: DailyDeliveryLog[];
  tomorrowLogs: DailyDeliveryLog[];
  onSkip: (log: DailyDeliveryLog) => void;
  onChangeQuantity: (log: DailyDeliveryLog, quantity: number) => void;
};

function DeliveryItem({
  log,
  onSkip,
  onChangeQuantity,
}: {
  log: DailyDeliveryLog;
  onSkip: (log: DailyDeliveryLog) => void;
  onChangeQuantity: (log: DailyDeliveryLog, quantity: number) => void;
}) {
  const shownQuantity = log.temporary_quantity || log.quantity;

  return (
    <article className="sr-dashboard-inset rounded-2xl p-2.5 md:p-3">
      <div className="flex items-center gap-3">
        <img src={log.product.image} alt={log.product.name} className="h-10 w-10 rounded-xl object-cover shadow-[0_10px_18px_rgba(58,78,43,0.12)] md:h-12 md:w-12" loading="lazy" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black text-[#1d2418] md:text-sm">{log.product.name}</p>
          <p className="text-xs text-[#766f55]">
            Qty {shownQuantity} • {log.delivery_time} • {log.status}
          </p>
        </div>
        <span className="rounded-full bg-white/65 px-2 py-1 text-[10px] font-bold capitalize text-[#4f7e3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {log.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChangeQuantity(log, Math.max(1, shownQuantity - 1))}
          className="sr-stepper-button rounded-full bg-white/70 p-2 text-[#4f7e3f] shadow-[0_8px_16px_rgba(58,78,43,0.11),inset_0_1px_0_rgba(255,255,255,0.8)]"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span key={shownQuantity} className="sr-quantity-number min-w-8 text-center text-sm font-black text-[#1d2418]">{shownQuantity}</span>
        <button
          type="button"
          onClick={() => onChangeQuantity(log, shownQuantity + 1)}
          className="sr-stepper-button rounded-full bg-white/70 p-2 text-[#4f7e3f] shadow-[0_8px_16px_rgba(58,78,43,0.11),inset_0_1px_0_rgba(255,255,255,0.8)]"
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSkip(log)}
          className="ml-auto rounded-xl bg-white/65 px-2.5 py-2 text-[11px] font-black text-[#4f7e3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:bg-white/80 md:px-3 md:text-xs"
        >
          Skip this day
        </button>
      </div>
    </article>
  );
}

export default function DeliveryDayDetails({ selectedDate, selectedLogs, tomorrowLogs, onSkip, onChangeQuantity }: DeliveryDayDetailsProps) {
  const readableDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <section className="sr-dashboard-card sr-selected-delivery-card relative overflow-hidden rounded-[1.5rem] p-3.5 md:p-4">
      <span className="sr-milk-swirl sr-milk-swirl-delivery" aria-hidden="true" />
      <span className="sr-droplet-accent left-5 top-16" aria-hidden="true" />
      <span className="sr-leaf-accent left-32 top-8" aria-hidden="true" />
      <div className="pointer-events-none absolute right-0 top-8 z-0 hidden h-44 w-40 md:block">
        <div className="absolute right-3 top-8 h-28 w-28 rounded-full bg-[#f3c977]/35 blur-2xl" />
        <img
          src="/transparent_bottle.png"
          alt=""
          className="absolute right-2 top-0 h-40 w-auto object-contain opacity-90 drop-shadow-[0_20px_18px_rgba(58,78,43,0.16)]"
          aria-hidden="true"
          draggable={false}
        />
      </div>
      <div className="relative z-10 mb-3 flex items-start justify-between gap-3 md:pr-32">
        <div>
          <h3 className="text-sm font-black text-[#1d2418] md:text-base">Selected day delivery</h3>
          <p className="text-xs text-[#766f55]">{readableDate}</p>
        </div>
        <CalendarCheck className="h-5 w-5 text-[#4f7e3f]" />
      </div>

      {selectedLogs.length === 0 ? (
        <div className="sr-dashboard-inset relative z-10 rounded-2xl p-4 text-center md:p-5">
          <p className="font-black text-[#1d2418]">No delivery scheduled</p>
          <p className="mt-1 text-xs text-[#766f55]">This day does not match your active subscription rules.</p>
        </div>
      ) : (
        <div className="relative z-10 grid gap-2 md:pr-28">
          {selectedLogs.map((log) => (
            <DeliveryItem key={log.id} log={log} onSkip={onSkip} onChangeQuantity={onChangeQuantity} />
          ))}
        </div>
      )}

      <div className="sr-dashboard-inset relative z-10 mt-3 rounded-2xl p-3 md:mt-4">
        <p className="text-xs font-black uppercase text-[#766f55]">Tomorrow preview</p>
        {tomorrowLogs.length === 0 ? (
          <p className="mt-2 text-sm text-[#766f55]">No order tomorrow.</p>
        ) : (
          <div className="mt-2 grid gap-2">
            {tomorrowLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-bold text-[#1d2418]">{log.product.name}</span>
                <span className="text-[#766f55]">Qty {log.temporary_quantity || log.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
