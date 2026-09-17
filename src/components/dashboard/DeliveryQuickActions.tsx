import { Ban, PauseCircle, PlayCircle, PlusCircle } from "lucide-react";

type DeliveryQuickActionsProps = {
  canAct: boolean;
  onSkipSelected: () => void;
  onPauseTomorrow: () => void;
  onResume: () => void;
  onAddExtra: () => void;
};

export default function DeliveryQuickActions({ canAct, onSkipSelected, onPauseTomorrow, onResume, onAddExtra }: DeliveryQuickActionsProps) {
  const actions = [
    { label: "Skip this day", icon: Ban, onClick: onSkipSelected, disabled: !canAct },
    { label: "Pause tomorrow", icon: PauseCircle, onClick: onPauseTomorrow, disabled: false },
    { label: "Resume", icon: PlayCircle, onClick: onResume, disabled: false },
    { label: "Add extra items", icon: PlusCircle, onClick: onAddExtra, disabled: false },
  ];

  return (
    <section className="sr-dashboard-card relative overflow-hidden rounded-[1.5rem] p-3">
      <span className="sr-milk-swirl sr-milk-swirl-actions" aria-hidden="true" />
      <div className="relative z-10 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              onClick={action.onClick}
              className="sr-soft-pill-action min-w-[112px] rounded-xl px-2 py-2.5 text-center transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-0 sm:py-3"
            >
              <Icon className="mx-auto h-4 w-4 text-[#4f7e3f] sm:h-5 sm:w-5" />
              <span className="mt-2 block text-[11px] font-black leading-tight text-[#1d2418]">{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
