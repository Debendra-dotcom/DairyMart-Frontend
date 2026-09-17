import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireCompleteProfile = false,
}: {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
}) {
  const { isLoggedIn, isAuthLoading, user } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#fbf8ef] p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white/80 p-6 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded-full bg-[#eef0e6]" />
          <div className="mt-4 h-28 animate-pulse rounded-2xl bg-[#eef0e6]" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (requireCompleteProfile && (!user?.name?.trim() || !user?.phone?.trim())) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
