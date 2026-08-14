import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: "◈" },
  { to: "/rooms", label: "Rooms", icon: "▤" },
  { to: "/guests", label: "Guests", icon: "◐" },
  { to: "/bookings", label: "Bookings", icon: "▥" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-ink text-paper min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-paper/10">
        <h1 className="font-display text-xl tracking-tight">Harborline</h1>
        <p className="text-xs text-paper/50 mt-0.5 font-mono uppercase tracking-wider">
          Hotel Management
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal text-paper"
                  : "text-paper/70 hover:bg-paper/10 hover:text-paper"
              }`
            }
          >
            <span className="w-4 text-center">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-paper/10">
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <p className="text-xs text-paper/50 capitalize font-mono">{user?.role}</p>
        <button
          onClick={logout}
          className="mt-3 text-xs text-brass-light hover:text-brass transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
