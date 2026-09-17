import { useEffect, useState } from "react";
import { ArrowLeft, Milk } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import AccountMenu from "../components/profile/AccountMenu";
import AddressBook from "../components/profile/AddressBook";
import AddressFormModal from "../components/profile/AddressFormModal";
import DailyCalendar from "../components/profile/DailyCalendar";
import EditProfileModal from "../components/profile/EditProfileModal";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePhotoUpload from "../components/profile/ProfilePhotoUpload";
import ProfileProductSections from "../components/profile/ProfileProductSections";
import WalletDeliveryCard from "../components/profile/WalletDeliveryCard";
import { useAuth } from "../context/AuthContext";
import { debugAuthState } from "../services/authStorage";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  getProfile,
  setDefaultAddress,
  updateAddress,
  updateProfile,
  uploadProfilePhoto,
} from "../services/profileApi";
import type { Address, AddressPayload, Profile } from "../types/profile";

function getVacationModeKey(userId?: number) {
  return userId ? `sr_vacation_mode:${userId}` : "sr_vacation_mode:guest";
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="h-40 rounded-2xl bg-[#f1f3ed] animate-pulse" />
      <div className="h-64 rounded-2xl bg-[#f1f3ed] animate-pulse" />
      <div className="h-72 rounded-2xl bg-[#f1f3ed] animate-pulse" />
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthLoading, isLoggedIn, setUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [vacationMode, setVacationMode] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProfile();
      if (user?.id && data.id !== user.id) {
        debugAuthState("profile-user-mismatch", { authUserId: user.id, fetchedUserId: data.id });
        logout();
        navigate("/");
        return;
      }
      setProfile(data);
      setUserProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressLoading(true);
    try {
      setAddresses(await getAddresses());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      setAddressLoading(false);
      setProfile(null);
      setAddresses([]);
      return;
    }
    debugAuthState("profile-page-load", { userId: user?.id, email: user?.email });
    loadProfile();
    loadAddresses();
  }, [isAuthLoading, isLoggedIn, user?.id]);

  useEffect(() => {
    setVacationMode(localStorage.getItem(getVacationModeKey(user?.id)) === "true");
  }, [user?.id]);

  const handleUpdateProfile = async (values: { name: string; email: string; phone: string }) => {
    setSaving(true);
    try {
      const data = await updateProfile({ name: values.name, phone: values.phone });
      setProfile(data);
      setUserProfile(data);
      setShowEditProfile(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    setSaving(true);
    try {
      const data = await uploadProfilePhoto(file);
      setProfile(data);
      setUserProfile(data);
      setShowPhotoUpload(false);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (payload: AddressPayload) => {
    setSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
        toast.success("Address updated");
      } else {
        await addAddress(payload);
        toast.success("Address added");
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleVacationChange = (value: boolean) => {
    setVacationMode(value);
    localStorage.setItem(getVacationModeKey(profile?.id || user?.id), String(value));
    toast.success(value ? "Vacation mode enabled" : "Vacation mode disabled");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8ef] p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <ProfileSkeleton />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#fbf8ef] p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#e9eadf] p-6 text-center max-w-md">
          <Milk className="w-10 h-10 mx-auto text-[#2f6b3f]" />
          <h1 className="mt-3 text-xl font-bold text-[#18251b]">Profile unavailable</h1>
          <p className="mt-2 text-sm text-[#667064]">{error || "Please login again."}</p>
          <button onClick={() => navigate("/")} className="mt-5 rounded-xl bg-[#2f6b3f] px-4 py-2.5 text-white font-semibold">
            Back home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8ef]">
      <Toaster richColors position="top-right" />
      <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8">
        <button onClick={() => navigate("/")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2f6b3f]">
          <ArrowLeft className="w-4 h-4" />
          Back to shop
        </button>

        <div className="grid lg:grid-cols-[1.5fr_0.9fr] gap-5">
          <div className="grid gap-5">
            <ProfileHeader profile={profile} onEdit={() => setShowEditProfile(true)} onPhotoClick={() => setShowPhotoUpload(true)} />
            <WalletDeliveryCard vacationMode={vacationMode} onVacationChange={handleVacationChange} onToast={(message) => toast.success(message)} />
            <DailyCalendar onModifyTomorrow={() => toast.info("Tomorrow order editor coming soon")} />
            <AddressBook
              addresses={addresses}
              loading={addressLoading}
              onAdd={() => {
                setEditingAddress(null);
                setShowAddressForm(true);
              }}
              onEdit={(address) => {
                setEditingAddress(address);
                setShowAddressForm(true);
              }}
              onDelete={async (address) => {
                await deleteAddress(address.id);
                toast.success("Address deleted");
                await loadAddresses();
              }}
              onDefault={async (address) => {
                await setDefaultAddress(address.id);
                toast.success("Default address updated");
                await loadAddresses();
              }}
            />
            <ProfileProductSections />
          </div>

          <AccountMenu onLogout={handleLogout} />
        </div>
      </div>

      {showEditProfile && (
        <EditProfileModal profile={profile} saving={saving} onClose={() => setShowEditProfile(false)} onSave={handleUpdateProfile} />
      )}

      {showPhotoUpload && (
        <ProfilePhotoUpload saving={saving} onClose={() => setShowPhotoUpload(false)} onUpload={handleUploadPhoto} />
      )}

      {showAddressForm && (
        <AddressFormModal address={editingAddress} saving={saving} onClose={() => setShowAddressForm(false)} onSave={handleSaveAddress} />
      )}
    </main>
  );
}
