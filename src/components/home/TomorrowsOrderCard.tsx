type TomorrowOrderItem = {
  name: string;
  quantity: number;
  image: string;
};

const tomorrowItems: TomorrowOrderItem[] = [
  { name: "Full Cream Milk", quantity: 2, image: "/full-cream-milk-500.jpg" },
  { name: "Fresh Curd", quantity: 1, image: "/fresh-curd-400.jpg" },
  { name: "Paneer", quantity: 1, image: "/paneer-200.jpg" },
];

type TomorrowsOrderCardProps = {
  onEdit: () => void;
  onSkip: () => void;
};

export default function TomorrowsOrderCard({ onEdit, onSkip }: TomorrowsOrderCardProps) {
  return (
    <section className="rounded-2xl border border-[#e8eadf] bg-white p-4 shadow-[0_12px_36px_rgba(34,45,31,0.07)] transition hover:-translate-y-0.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#152015]">Tomorrow's order</h3>
          <p className="text-xs text-[#6a735f]">Scheduled for 7 AM delivery</p>
        </div>
        <span className="rounded-full bg-[#eef8ea] px-2.5 py-1 text-[11px] font-bold text-[#2f6b3f]">
          3 items
        </span>
      </div>

      <div className="grid gap-2">
        {tomorrowItems.map((item) => (
          <div key={item.name} className="flex items-center gap-3 rounded-xl bg-[#fbf8ef] p-2.5">
            <img src={item.image} alt={item.name} className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#152015]">{item.name}</p>
              <p className="text-xs text-[#6a735f]">Qty {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl bg-[#2f6b3f] py-2.5 text-xs font-bold text-white transition hover:bg-[#285a36]"
        >
          Edit Order
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-[#dfe8d7] bg-white py-2.5 text-xs font-bold text-[#2f6b3f] transition hover:bg-[#f5faf2]"
        >
          Skip Tomorrow
        </button>
      </div>
    </section>
  );
}
