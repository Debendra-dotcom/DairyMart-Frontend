import { Edit2, Home, MapPin, Plus, Star, Trash2 } from "lucide-react";
import type { Address } from "../../types/profile";

type AddressBookProps = {
  addresses: Address[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onDefault: (address: Address) => void;
};

export default function AddressBook({ addresses, loading, onAdd, onEdit, onDelete, onDefault }: AddressBookProps) {
  return (
    <section className="bg-white border border-[#e9eadf] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#18251b]">Address book</h2>
          <p className="text-sm text-[#667064]">Manage delivery preferences.</p>
        </div>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-[#2f6b3f] px-3 py-2 text-sm font-semibold text-white">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-[#f1f3ed] animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl bg-[#f8f4e9] p-6 text-center">
          <MapPin className="w-9 h-9 mx-auto text-[#2f6b3f]" />
          <p className="mt-3 font-semibold text-[#18251b]">No addresses yet</p>
          <p className="text-sm text-[#667064]">Add a delivery address for quicker checkout.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-[#e9eadf] p-4 hover:shadow-sm transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eef7ec] flex items-center justify-center text-[#2f6b3f] shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[#18251b]">{address.house_flat}, {address.area}</p>
                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4d7] px-2 py-0.5 text-xs font-semibold text-[#936000]">
                        <Star className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#667064] mt-1">
                    {[address.landmark, address.city, address.pincode].filter(Boolean).join(", ")}
                  </p>
                  {address.delivery_instruction && (
                    <p className="text-sm text-[#667064] mt-1">{address.delivery_instruction}</p>
                  )}
                  <p className="text-xs font-semibold text-[#2f6b3f] mt-2">
                    {address.leave_at_door ? "Leave at door" : "Hand over"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!address.is_default && (
                  <button type="button" onClick={() => onDefault(address)} className="rounded-lg border border-[#d9dccf] px-3 py-2 text-xs font-semibold text-[#3f493f]">
                    Set default
                  </button>
                )}
                <button type="button" onClick={() => onEdit(address)} className="inline-flex items-center gap-1 rounded-lg border border-[#d9dccf] px-3 py-2 text-xs font-semibold text-[#3f493f]">
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(address)} className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
