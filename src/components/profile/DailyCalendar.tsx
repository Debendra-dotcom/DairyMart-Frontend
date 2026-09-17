import { CalendarDays } from "lucide-react";

type DailyCalendarProps = {
  onModifyTomorrow: () => void;
};

function makeDays() {
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      key: date.toISOString(),
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: date.getDate(),
      label: index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toLocaleDateString("en-IN", { month: "short" }),
      active: index === 1,
    };
  });
}

export default function DailyCalendar({ onModifyTomorrow }: DailyCalendarProps) {
  const days = makeDays();

  return (
    <section className="bg-white border border-[#e9eadf] rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-bold text-[#18251b]">Daily calendar</h2>
          <p className="text-xs text-[#667064]">Plan upcoming dairy deliveries.</p>
        </div>
        <CalendarDays className="w-4 h-4 text-[#2f6b3f]" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((item) => (
          <div
            key={item.key}
            className={`min-w-[64px] rounded-xl border p-2 text-center ${item.active ? "border-[#2f6b3f] bg-[#eef7ec]" : "border-[#e9eadf] bg-white"}`}
          >
            <p className="text-[10px] font-semibold text-[#667064]">{item.day}</p>
            <p className="mt-0.5 text-xl font-bold text-[#18251b]">{item.date}</p>
            <p className="mt-1 text-[10px] font-bold text-[#2f6b3f]">{item.label}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onModifyTomorrow}
        className="mt-3 w-full rounded-xl bg-[#2f6b3f] py-2.5 text-xs font-bold text-white hover:bg-[#285a36] transition"
      >
        Modify tomorrow order
      </button>
    </section>
  );
}
