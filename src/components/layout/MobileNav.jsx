import { Link, useLocation } from "react-router-dom";
import {
  CreditCard,
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { path: "/Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/Bills", label: "Bills", icon: Receipt },
  { path: "/Income", label: "Income", icon: Wallet },
  { path: "/Balances", label: "Balances", icon: CreditCard },
  { path: "/Analytics", label: "Analytics", icon: BarChart3 },
  { path: "/Settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
              />
              {item.label}
            </Link>
          );
        })}
        <div className="px-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
