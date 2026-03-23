import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router-dom";

const navItems = [
  { path: "/Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/Bills", label: "Bills", icon: Receipt },
  { path: "/Income", label: "Income", icon: Wallet },
  { path: "/Analytics", label: "Analytics", icon: BarChart3 },
  { path: "/Settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border min-h-screen p-6">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            <span className="text-primary">Bills-n-</span>Budget
          </h1>
          <ThemeToggle />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Smart money management
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </aside>
  );
}
