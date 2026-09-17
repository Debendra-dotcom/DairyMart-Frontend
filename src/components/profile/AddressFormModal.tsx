import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Address, AddressPayload } from "../../types/profile";

const emptyAddress: AddressPayload = {
  house_flat: "",
  area: "",
  landmark: "",
  city: "",
  pincode: "",
  delivery_instruction: "",
  leave_at_door: false,
  is_default: false,
};

type AddressFormModalProps = {
  address?: Address | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: AddressPayload) => Promise<void>;
};

export default function AddressFormModal({ address, saving, onClose, onSave }: AddressFormModalProps) {
  const [form, setForm] = useState<AddressPayload>(emptyAddress);

  useEffect(() => {
    setForm(
      address
        ? {
            house_flat: address.house_flat,
            area: address.area,
            landmark: address.landmark,
            city: address.city,
            pincode: address.pincode,
            delivery_instruction: address.delivery_instruction,
            leave_at_door: address.leave_at_door,
            is_default: address.is_default,
          }
        : emptyAddress,
    );
  }, [address]);

  const updateField = (field: keyof AddressPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 flex items-end sm:items-center justify-center px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#18251b]">{address ? "Edit address" : "Add address"}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.house_flat} onChange={(event) => updateField("house_flat", event.target.value)} placeholder="House/Flat number" className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]" />
          <input value={form.area} onChange={(event) => updateField("area", event.target.value)} placeholder="Area" className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]" />
          <input value={form.landmark} onChange={(event) => updateField("landmark", event.target.value)} placeholder="Landmark" className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]" />
          <input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="City" className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]" />
          <input value={form.pincode} onChange={(event) => updateField("pincode", event.target.value)} placeholder="Pincode" className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]" />
          <label className="rounded-xl border border-[#e2e4d8] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#3d493f]">Set as default</span>
            <input type="checkbox" checked={form.is_default} onChange={(event) => updateField("is_default", event.target.checked)} />
          </label>
          <textarea
            value={form.delivery_instruction}
            onChange={(event) => updateField("delivery_instruction", event.target.value)}
            placeholder="Delivery instruction"
            className="sm:col-span-2 min-h-24 rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]"
          />
        </div>

        <div className="mt-4 rounded-xl bg-[#f7fbf4] p-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#18251b]">Leave at door</p>
            <p className="text-sm text-[#667064]">Turn off to hand over directly.</p>
          </div>
          <button
            type="button"
            onClick={() => updateField("leave_at_door", !form.leave_at_door)}
            className={`w-12 h-7 rounded-full p-1 transition ${form.leave_at_door ? "bg-[#2f6b3f]" : "bg-gray-300"}`}
            aria-label="Toggle leave at door"
          >
            <span className={`block w-5 h-5 rounded-full bg-white transition ${form.leave_at_door ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#d9dccf] py-3 font-semibold text-[#3f493f]">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave(form)}
            className="flex-1 rounded-xl bg-[#2f6b3f] py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
