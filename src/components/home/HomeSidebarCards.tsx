import { Gift, Headphones, Home, PackageCheck, Repeat } from "lucide-react";

type HomeSidebarCardsProps = {
  onNotice: (message: string) => void;
};

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="sr-dashboard-card relative min-w-[210px] overflow-hidden rounded-[1.35rem] p-3.5 transition hover:-translate-y-0.5 md:min-w-0 md:p-4">
      <span className="sr-milk-swirl sr-milk-swirl-mini" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function HomeSidebarCards({ onNotice }: HomeSidebarCardsProps) {
  const addressPreview = "Add your home address";

  return (
    <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0">
      <MiniCard>
        <div className="flex items-start gap-2.5">
          <span className="sr-mini-icon">
            <PackageCheck className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#1d2418]">Next delivery</h3>
              <span className="rounded-full bg-white/55 px-2 py-0.5 text-[10px] font-bold text-[#4f7e3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                Scheduled
              </span>
            </div>
            <p className="mt-1 text-xs text-[#766f55]">Tomorrow 7 AM</p>
            <p className="mt-2 text-sm font-black text-[#1d2418]">2 items scheduled</p>
          </div>
        </div>
      </MiniCard>

      <MiniCard>
        <div className="flex items-start gap-2.5">
          <span className="sr-mini-icon">
            <Home className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-[#1d2418]">Default address</h3>
            <p className="mt-1 truncate text-xs text-[#766f55]">{addressPreview}</p>
            <button type="button" onClick={() => onNotice("Address selector coming soon")} className="mt-2 text-xs font-black text-[#4f7e3f]">
              Change
            </button>
          </div>
        </div>
      </MiniCard>

      <MiniCard>
        <div className="flex items-start gap-2.5">
          <span className="sr-mini-icon">
            <Repeat className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-[#1d2418]">Daily Milk Plan</h3>
            <p className="mt-1 text-xs text-[#766f55]">2 active products</p>
            <button type="button" onClick={() => onNotice("Subscription manager coming soon")} className="mt-2 text-xs font-black text-[#4f7e3f]">
              Manage
            </button>
          </div>
        </div>
      </MiniCard>

      <MiniCard>
        <div className="flex items-start gap-2.5">
          <span className="sr-mini-icon">
            <Headphones className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-[#1d2418]">Quick support</h3>
            <p className="mt-1 text-xs text-[#766f55]">Missing item - Late delivery</p>
            <button type="button" onClick={() => onNotice("Support center coming soon")} className="mt-2 text-xs font-black text-[#4f7e3f]">
              Help
            </button>
          </div>
        </div>
      </MiniCard>

      <MiniCard>
        <div className="flex items-start gap-2.5">
          <span className="sr-mini-icon text-[#8a6400]">
            <Gift className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-[#1d2418]">Invite a friend</h3>
            <p className="mt-1 text-xs text-[#766f55]">Earn ₹50 wallet credit</p>
            <button type="button" onClick={() => onNotice("Referral link copied")} className="mt-2 text-xs font-black text-[#4f7e3f]">
              Invite
            </button>
          </div>
        </div>
      </MiniCard>
    </div>
  );
}
