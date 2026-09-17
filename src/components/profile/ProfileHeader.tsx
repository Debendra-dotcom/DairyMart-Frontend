import { BadgeCheck, CalendarDays, Mail, Pencil, Phone } from "lucide-react";
import type { Profile } from "../../types/profile";

type ProfileHeaderProps = {
  profile: Profile;
  onEdit: () => void;
  onPhotoClick: () => void;
};

export default function ProfileHeader({ profile, onEdit, onPhotoClick }: ProfileHeaderProps) {
  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section className="bg-white border border-[#e9eadf] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
        <button
          type="button"
          onClick={onPhotoClick}
          className="relative w-24 h-24 rounded-full overflow-hidden bg-[#eef7ec] text-[#2f6b3f] text-4xl font-bold flex items-center justify-center ring-4 ring-[#f8f3e8]"
          aria-label="Change profile photo"
        >
          {profile.profile_image ? (
            <img src={profile.profile_image} alt={profile.name || "Profile"} className="w-full h-full object-cover" />
          ) : (
            (profile.name || profile.mobile_number).charAt(0).toUpperCase()
          )}
          <span className="absolute bottom-1 right-1 bg-[#2f6b3f] text-white rounded-full p-1.5">
            <Pencil className="w-3.5 h-3.5" />
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[#18251b] truncate">{profile.name || "Complete your profile"}</h1>
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f6e6] text-[#2f6b3f] px-2.5 py-1 text-xs font-semibold">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-2 text-sm text-[#59645b]">
            <span className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-[#2f6b3f]" />
              <span className="truncate">{profile.email || "Email not added"}</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2f6b3f]" />
              {profile.phone || profile.mobile_number}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#2f6b3f]" />
              Joined {joinedDate}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f6b3f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#265834] transition"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
      </div>
    </section>
  );
}
