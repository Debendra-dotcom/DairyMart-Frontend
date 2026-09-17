import { Clock, Plane, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";

type HomeWalletCardProps = {
  vacationMode: boolean;
  onVacationChange: (value: boolean) => void;
};

function nextDeliveryCountdown() {
  const now = new Date();
  const delivery = new Date(now);
  delivery.setDate(now.getDate() + 1);
  delivery.setHours(7, 0, 0, 0);

  const diff = Math.max(0, delivery.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function HomeWalletCard({ vacationMode, onVacationChange }: HomeWalletCardProps) {
  const [countdown, setCountdown] = useState(nextDeliveryCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(nextDeliveryCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="sr-dashboard-card sr-dashboard-card-glow relative overflow-hidden rounded-[1.7rem] p-4 md:p-5">
      <span className="sr-milk-swirl sr-milk-swirl-wallet" aria-hidden="true" />
      <span className="sr-leaf-accent right-5 top-16" aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between gap-3 md:gap-4">
        <div>
          <p className="text-xs font-bold text-[#766f55] md:text-sm">SR Wallet</p>
          <div className="mt-1 flex items-center gap-2">
            <WalletCards className="h-4 w-4 text-[#4f7e3f] md:h-5 md:w-5" />
            <p className="text-3xl font-black text-[#1d2418]">₹0</p>
          </div>
        </div>
        <span className="rounded-full bg-white/45 px-3 py-1 text-xs font-bold text-[#4f7e3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          UI only
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 md:mt-5">
        {[100, 200, 500].map((amount) => (
          <button
            key={amount}
            type="button"
            className="sr-raised-money-button rounded-xl py-2.5 text-xs font-black transition hover:-translate-y-0.5 md:rounded-2xl md:py-3 md:text-sm"
          >
            ₹{amount}
          </button>
        ))}
      </div>

      <div className="sr-dashboard-inset relative z-10 mt-4 rounded-2xl p-3 md:mt-5 md:p-4">
        <div className="flex items-center gap-2 text-[#846220]">
          <Clock className="h-4 w-4" />
          <p className="text-xs font-bold md:text-sm">Order within {countdown} for 7 AM delivery</p>
        </div>
      </div>

      <div className="sr-dashboard-inset relative z-10 mt-3 flex items-center justify-between gap-3 rounded-2xl p-3 md:mt-4 md:p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[#4f7e3f] shadow-[0_10px_18px_rgba(58,78,43,0.12)]">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black text-[#1d2418] md:text-base">Vacation mode</p>
            <p className="text-xs text-[#766f55] md:text-sm">Pause doorstep delivery</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onVacationChange(!vacationMode)}
          className={`sr-vacation-toggle h-8 w-14 rounded-full p-1 shadow-inner ${vacationMode ? "is-active bg-gradient-to-r from-[#25452a] to-[#735528]" : "bg-[#d7dbd0]"}`}
          aria-label="Toggle vacation mode"
        >
          <span className={`sr-vacation-toggle-knob block h-6 w-6 rounded-full bg-white shadow-sm ${vacationMode ? "translate-x-6" : ""}`} />
        </button>
      </div>
    </section>
  );
}
