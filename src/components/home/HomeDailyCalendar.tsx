import { CalendarDays } from "lucide-react";

type HomeDailyCalendarProps = {
  onModifyTomorrow: () => void;
  selectedDate?: string;
  deliveryDates?: string[];
  onSelectDate?: (date: string) => void;
};

function makeCalendarDays() {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return {
      id: dateKey,
      weekday: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : "Deliver",
    };
  });
}

export default function HomeDailyCalendar({ onModifyTomorrow, selectedDate, deliveryDates = [], onSelectDate }: HomeDailyCalendarProps) {
  const days = makeCalendarDays();

  return (
    <section className="sr-dashboard-card relative overflow-hidden rounded-[1.5rem] p-4">
      <span className="sr-milk-swirl sr-milk-swirl-calendar" aria-hidden="true" />
      <span className="sr-droplet-accent right-14 top-6" aria-hidden="true" />
      <span className="sr-droplet-accent right-8 top-12 h-2 w-2" aria-hidden="true" />
      <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#1d2418]">Daily delivery calendar</h2>
          <p className="text-xs text-[#766f55]">Swipe to preview upcoming slots.</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/55 text-[#4f7e3f] shadow-[0_10px_18px_rgba(58,78,43,0.12)]">
          <CalendarDays className="h-4 w-4" />
        </span>
      </div>

      <div className="relative z-10 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDate?.(day.id)}
            className={`min-w-[66px] rounded-2xl p-2 text-center transition hover:-translate-y-0.5 ${
              selectedDate === day.id ? "sr-calendar-day-active" : "sr-calendar-day"
            }`}
          >
            <p className="text-[10px] font-bold text-[#766f55]">{day.weekday}</p>
            <p className="mt-0.5 text-xl font-black text-[#1d2418]">{day.date}</p>
            <p className="text-[10px] text-[#766f55]">{day.month}</p>
            <p className="mt-1 text-[10px] font-black text-[#4f7e3f]">{deliveryDates.includes(day.id) ? "Order" : day.label}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onModifyTomorrow}
        className="sr-primary-dashboard-button relative z-10 mt-3 w-full rounded-xl py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5"
      >
        Modify tomorrow order
      </button>
    </section>
  );
}
