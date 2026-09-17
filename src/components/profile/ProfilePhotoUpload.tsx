import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

type ProfilePhotoUploadProps = {
  saving: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
};

export default function ProfilePhotoUpload({ saving, onClose, onUpload }: ProfilePhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 flex items-end sm:items-center justify-center px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#18251b]">Profile photo</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="min-h-56 rounded-2xl border-2 border-dashed border-[#bdd9b8] bg-[#f7fbf4] flex flex-col items-center justify-center text-center p-6 cursor-pointer">
          {preview ? (
            <img src={preview} alt="Profile preview" className="w-40 h-40 rounded-full object-cover ring-4 ring-white shadow" />
          ) : (
            <>
              <ImagePlus className="w-10 h-10 text-[#2f6b3f]" />
              <span className="mt-3 font-semibold text-[#18251b]">Choose a photo</span>
              <span className="mt-1 text-sm text-[#667064]">PNG or JPG from your device</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#d9dccf] py-3 font-semibold text-[#3f493f]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || saving}
            onClick={() => file && onUpload(file)}
            className="flex-1 rounded-xl bg-[#2f6b3f] py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Uploading..." : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
