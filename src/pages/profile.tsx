import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      <div className="bg-white shadow p-6 rounded-xl max-w-md">
        <p className="mb-3">
          <strong>Email:</strong> {user?.email}
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
