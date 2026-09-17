import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Profile } from "../../types/profile";

type EditProfileModalProps = {
  profile: Profile;
  saving: boolean;
  onClose: () => void;
  onSave: (values: { name: string; email: string; phone: string }) => Promise<void>;
};

export default function EditProfileModal({ profile, saving, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || profile.mobile_number || "");

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email || "");
    setPhone(profile.phone || profile.mobile_number || "");
  }, [profile]);

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 flex items-end sm:items-center justify-center px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#18251b]">Edit profile</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]"
          />
          <input
            value={email}
            placeholder="Email"
            type="email"
            readOnly
            className="w-full rounded-xl border border-[#e2e4d8] bg-[#f7fbf4] px-4 py-3 text-[#667064] outline-none"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Mobile number"
            className="w-full rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#d9dccf] py-3 font-semibold text-[#3f493f]">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave({ name, email, phone })}
            className="flex-1 rounded-xl bg-[#2f6b3f] py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
