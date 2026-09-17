import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import AddressFormModal from "../components/profile/AddressFormModal";
import { useAuth } from "../context/AuthContext";
import { addAddress, getAddresses, updateProfile } from "../services/profileApi";
import type { AddressPayload } from "../types/profile";

export default function CompleteProfilePage() {
  const { user, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || user?.mobile_number || "");
  const [saving, setSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);

  useEffect(() => {
    getAddresses()
      .then((addresses) => setHasAddress(addresses.length > 0))
      .catch(() => setHasAddress(false));
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) {
      toast.warning("Name is required");
      return;
    }
    setSaving(true);
    try {
      const profile = await updateProfile({ name: name.trim(), phone: phone.trim() });
      setUserProfile(profile);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (payload: AddressPayload) => {
    setSaving(true);
    try {
      await addAddress({ ...payload, is_default: true });
      setHasAddress(true);
      setShowAddressForm(false);
      toast.success("Address saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const canContinue = Boolean(name.trim() && phone.trim() && hasAddress);

  return (
    <main className="min-h-screen bg-[#fbf8ef] px-4 py-8">
      <Toaster richColors position="top-right" />
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#e9eadf] bg-white/85 p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f7e3f]">Complete Profile</p>
        <h1 className="mt-2 text-3xl font-black text-[#18251b]">Finish your SR Dairy account</h1>
        <p className="mt-2 text-sm leading-6 text-[#667064]">Name and delivery address are required before checkout.</p>

        <div className="mt-6 grid gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone number"
            className="rounded-xl border border-[#e2e4d8] px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bc89f]"
          />
          <input
            value={user?.email || ""}
            readOnly
            placeholder="Email"
            type="email"
            className="rounded-xl border border-[#e2e4d8] bg-[#f7fbf4] px-4 py-3 text-[#667064]"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button disabled={saving} onClick={saveProfile} className="rounded-xl bg-[#2f6b3f] px-5 py-3 font-semibold text-white disabled:opacity-60">
            Save Profile
          </button>
          <button onClick={() => setShowAddressForm(true)} className="rounded-xl border border-[#d9dccf] px-5 py-3 font-semibold text-[#3f493f]">
            {hasAddress ? "Edit Address" : "Add Address"}
          </button>
        </div>

        <button
          disabled={!canContinue}
          onClick={() => navigate("/checkout")}
          className="mt-6 w-full rounded-2xl bg-[#152015] py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          Continue to Checkout
        </button>
      </section>

      {showAddressForm && (
        <AddressFormModal address={null} saving={saving} onClose={() => setShowAddressForm(false)} onSave={saveAddress} />
      )}
    </main>
  );
}
