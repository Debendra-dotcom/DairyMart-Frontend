import { Gift, Headphones, LogOut, Package, Repeat, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AccountMenuProps = {
  onLogout: () => void;
};

const menuItems = [
  { label: "My Orders", icon: Package, path: "/orders" },
  { label: "My Subscriptions", icon: Repeat, path: "/subscriptions" },
  { label: "Wallet", icon: WalletCards, path: "/wallet" },
  { label: "Coupons", icon: Gift, path: "/coupons" },
  { label: "Help & Support", icon: Headphones, path: "/support" },
];

export default function AccountMenu({ onLogout }: AccountMenuProps) {
  const navigate = useNavigate();

  return (
    <section className="bg-white border border-[#e9eadf] rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#18251b] mb-4">Account</h2>
      <div className="grid gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#f7fbf4] transition"
            >
              <span className="w-10 h-10 rounded-full bg-[#eef7ec] flex items-center justify-center text-[#2f6b3f]">
                <Icon className="w-5 h-5" />
              </span>
              <span className="font-semibold text-[#243024]">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-red-50 transition"
        >
          <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <LogOut className="w-5 h-5" />
          </span>
          <span className="font-semibold text-red-600">Logout</span>
        </button>
      </div>
    </section>
  );
}
