import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isHome = location.pathname === "/";

  const linkClass = (path) => {
    const active =
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path);
    return `px-3 py-1.5 text-sm font-medium rounded ${
      active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-gray-900 tracking-tight">
            HRS
          </Link>
          <nav className="flex items-center gap-1.5">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>
            <Link to="/search" className={linkClass("/search")}>
              Search Rooms
            </Link>
            {user ? (
              <>
                {["manager", "receptionist", "marketing"].includes(user.role) && (
                  <Link to="/dashboard" className={linkClass("/dashboard")}>
                    Dashboard
                  </Link>
                )}
                {user.role === "user" && (
                  <Link to="/account" className={linkClass("/account")}>
                    My Account
                  </Link>
                )}
                <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-1.5 text-sm font-medium text-red-600 rounded hover:bg-red-50 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/account/login"
                  className="ml-1 px-3 py-1.5 text-sm font-medium text-gray-600 rounded hover:bg-gray-100"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs text-gray-400 rounded hover:bg-gray-100"
                >
                  Staff
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content — full width for homepage, constrained for other pages */}
      {isHome ? (
        <main className="flex-1">{children}</main>
      ) : (
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            Hotel Reservation System &copy; 2026 &mdash; University SE Prototype
          </p>
          <p className="text-xs text-gray-400 text-center sm:text-right">
            Team: Bartosz Garba, Damian Barłożek, Krzysztof Cholewa, Ivan-Antonii Zamishchak
          </p>
        </div>
      </footer>
    </div>
  );
}
