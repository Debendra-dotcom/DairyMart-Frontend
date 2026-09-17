import { Ban, PauseCircle, PlusCircle } from "lucide-react";

type DeliveryQuickActionsProps = {
  onSkip: () => void;
  onPause: () => void;
  onAddExtra: () => void;
};

const actions = [
  { label: "Skip Tomorrow", icon: Ban, key: "skip" },
  { label: "Pause Delivery", icon: PauseCircle, key: "pause" },
  { label: "Add Extra Items", icon: PlusCircle, key: "extra" },
];

export default function DeliveryQuickActions({ onSkip, onPause, onAddExtra }: DeliveryQuickActionsProps) {
  const handlers = {
    skip: onSkip,
    pause: onPause,
    extra: onAddExtra,
  };

  return (
    <section className="rounded-2xl border border-[#e8eadf] bg-white p-3 shadow-[0_12px_36px_rgba(34,45,31,0.06)]">
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={handlers[action.key as keyof typeof handlers]}
              className="rounded-xl bg-[#f7fbf4] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:bg-[#eef8ea]"
            >
              <Icon className="mx-auto h-5 w-5 text-[#2f6b3f]" />
              <span className="mt-2 block text-[11px] font-bold leading-tight text-[#152015]">{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
