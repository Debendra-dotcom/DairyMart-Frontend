import { ArrowLeft, Milk } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AccountPlaceholderPageProps = {
  title: string;
  description: string;
};

export default function AccountPlaceholderPage({ title, description }: AccountPlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#fbf8ef] px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/profile")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2f6b3f]">
          <ArrowLeft className="w-4 h-4" />
          Back to profile
        </button>

        <section className="bg-white border border-[#e9eadf] rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#eef7ec] mx-auto flex items-center justify-center text-[#2f6b3f]">
            <Milk className="w-8 h-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#18251b]">{title}</h1>
          <p className="mt-2 text-[#667064]">{description}</p>
        </section>
      </div>
    </main>
  );
}
