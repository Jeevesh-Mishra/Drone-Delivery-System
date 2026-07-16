import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Map,
  Plane,
  Package,
  BarChart3,
  Bell,
  MessageSquare,
  Zap,
  ChevronDown,
  Calendar,
  Clock,
  Cloud,
  Shield,
  TrendingUp,
  LogOut,
} from 'lucide-react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet Management', icon: Plane },
  { id: 'route', label: 'Route Optimization', icon: Map },
  { id: 'delivery', label: 'Delivery Management', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// Map nav ids to actual working tabs
const tabMap: Record<string, string> = {
  dashboard: 'dashboard',
  fleet: 'fleet',
  route: 'route',
  delivery: 'delivery',
  analytics: 'analytics',
};

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, user, onLogout, children }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${monthNames[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;
  const dayStr = dayNames[time.getDay()];
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  // First name only
  const firstName = user?.name?.split(' ')[0] || 'Arjun';

  return (
    <div className="flex h-screen bg-[#f0f2f8] overflow-hidden">
      {/* ======== SIDEBAR ======== */}
      <aside className="sidebar w-56 flex flex-col shrink-0 select-none z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Drone Delivery</p>
            <p className="text-[10px] text-gray-400 leading-tight">Navigation System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const mappedTab = tabMap[item.id] || item.id;
            const isActive = activeTab === mappedTab;
            const isClickable = !!tabMap[item.id];

            return (
              <button
                key={item.id}
                onClick={() => isClickable && setActiveTab(mappedTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isClickable
                    ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
                    : 'text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile at bottom */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {firstName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.role || 'Captain'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.name || 'Arjun Verma'}</p>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-semibold text-gray-700">System Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft inline-block"></span>
              <span className="text-[10px] text-green-600 font-medium">All Systems Operational</span>
            </div>
            <div className="mt-2">
              <svg viewBox="0 0 80 20" className="w-full h-5">
                <polyline points="0,15 10,10 20,12 30,5 40,8 50,6 60,10 70,4 80,8"
                  fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 hover:border-red-200 transition-all group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ======== MAIN AREA ======== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER BAR */}
        <header className="h-14 bg-white/70 backdrop-blur-sm border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
          {/* Left: Back to Dashboard label (shown on non-dashboard pages) */}
          <div className="flex items-center gap-2">
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Dashboard
              </button>
            )}
          </div>

          {/* Right: Notification + Chat + Quick Action + Date/Time/Weather widgets */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-gray-500 transition-colors">
              <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>

            {/* Chat */}
            <button className="p-2 rounded-xl hover:bg-slate-100 text-gray-500 transition-colors">
              <MessageSquare className="w-[18px] h-[18px]" />
            </button>

            {/* Logout icon button in header */}
            <button
              onClick={onLogout}
              title="Sign out"
              className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>

            {/* Quick Action button */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              Quick Action
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Date widget */}
            <div className="header-widget hidden md:flex">
              <Calendar className="w-4 h-4 text-indigo-500 mb-0.5" />
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">{dateStr}</span>
              <span className="text-[10px] text-gray-400">{dayStr}</span>
            </div>

            {/* Time widget */}
            <div className="header-widget hidden md:flex">
              <Clock className="w-4 h-4 text-indigo-500 mb-0.5" />
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">{timeStr}</span>
              <span className="text-[10px] text-gray-400">IST</span>
            </div>

            {/* Weather widget */}
            <div className="header-widget hidden lg:flex">
              <Cloud className="w-4 h-4 text-blue-400 mb-0.5" />
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">28°C</span>
              <span className="text-[10px] text-gray-400">Partly Cloudy</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
