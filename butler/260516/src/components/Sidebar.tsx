import {
  Bot,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Newspaper,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  WalletCards,
  Bell,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const mainItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio", icon: WalletCards },
  { to: "/screener", label: "Screener", icon: SlidersHorizontal },
  { to: "/watchlist", label: "Watchlist", icon: Star },
  { to: "/ai", label: "AI 조언", icon: Bot },
  { to: "/news-reports", label: "News & Reports", icon: Newspaper },
  { to: "/disclosure-ir", label: "공시/IR", icon: FileText },
  { to: "/alerts", label: "자동매매 알림", icon: Bell },
  { to: "/plans", label: "구독플랜", icon: CircleDollarSign },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-lockup">
        <span className="logo-mark"><Sparkles size={18} /></span>
        <strong>내주가</strong>
      </div>
      <nav className="side-nav" aria-label="주요 메뉴">
        {mainItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/settings" className={({ isActive }) => (isActive ? "settings-button active" : "settings-button")}>
        <Settings size={18} />
        <span>설정</span>
      </NavLink>
    </aside>
  );
}
