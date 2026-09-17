import { Clock, Plane, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type WalletDeliveryCardProps = {
  vacationMode: boolean;
  onVacationChange: (value: boolean) => void;
  onToast: (message: string) => void;
};

function getDeliveryCountdown() {
  const now = new Date();
  const target = new Date(now);
  target.setDate(now.getDate() + 1);
  target.setHours(7, 0, 0, 0);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function WalletDeliveryCard({ vacationMode, onVacationChange, onToast }: WalletDeliveryCardProps) {
  const [countdown, setCountdown] = useState(getDeliveryCountdown());
  const topups = useMemo(() => [100, 200, 500], []);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getDeliveryCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="bg-white border border-[#e9eadf] rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#667064]">SR Wallet</p>
          <div className="mt-1 flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-[#2f6b3f]" />
            <h2 className="text-3xl font-bold text-[#18251b]">₹0</h2>
          </div>
        </div>

        <div className="rounded-full bg-[#eef7ec] px-3 py-1 text-xs font-bold text-[#2f6b3f]">UI only</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {topups.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onToast(`₹${amount} topup preview`)}
            className="rounded-xl border border-[#dfe6d8] bg-[#f7fbf4] py-2.5 text-sm font-bold text-[#2f6b3f] hover:bg-[#eef7ec] transition"
          >
            ₹{amount}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-[#fff8e8] p-4">
        <div className="flex items-center gap-2 text-[#936000]">
          <Clock className="w-4 h-4" />
          <p className="text-sm font-bold">Order within {countdown} for 7 AM delivery</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f7fbf4] p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2f6b3f]">
            <Plane className="w-5 h-5" />
          </span>
          <div>
            <p className="font-bold text-[#18251b]">Vacation mode</p>
            <p className="text-sm text-[#667064]">Pause daily deliveries.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onVacationChange(!vacationMode)}
          className={`w-12 h-7 rounded-full p-1 transition ${vacationMode ? "bg-[#2f6b3f]" : "bg-gray-300"}`}
          aria-label="Toggle vacation mode"
        >
          <span className={`block w-5 h-5 rounded-full bg-white transition ${vacationMode ? "translate-x-5" : ""}`} />
        </button>
      </div>
    </section>
  );
}
