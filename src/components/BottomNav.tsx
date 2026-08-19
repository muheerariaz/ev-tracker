import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Bike,
  History,
  TrendingUp,
  Wrench,
  ShoppingBag,
  Settings,
} from 'lucide-react';
import { Language, NavigationTab } from '../types';
import { translations } from '../translations';

export type TabType = NavigationTab;

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab?: (tab: TabType) => void;
  onTabChange?: (tab: TabType) => void;
  currentLanguage: Language;
  dueMaintenanceCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  currentLanguage,
  dueMaintenanceCount = 0,
}) => {
  const t = translations[currentLanguage] || translations.en;

  const handleTabClick = (tabId: TabType) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tabId);
    }
    if (typeof onTabChange === 'function') {
      onTabChange(tabId);
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: t.nav_dashboard || 'Dashboard', icon: LayoutDashboard },
    { id: 'tracking', label: t.nav_tracking || 'GPS Route', icon: Navigation },
    { id: 'garage', label: t.nav_garage || 'Garage', icon: Bike },
    { id: 'logs', label: t.nav_logs || 'Logs', icon: History },
    { id: 'slope', label: t.nav_slope_tool || 'Slope', icon: TrendingUp },
    { id: 'maintenance', label: t.nav_maintenance || 'Service', icon: Wrench, badge: dueMaintenanceCount },
    { id: 'store', label: t.nav_store || 'Store', icon: ShoppingBag },
    { id: 'settings', label: t.nav_settings || 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="w-full bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-1 sm:px-3 py-1 sm:py-1.5 transition-colors select-none z-50 pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-0.5 sm:gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              id={`bottom-nav-${item.id}`}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 px-0.5 sm:px-2 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation focus:outline-none ${
                isActive
                  ? 'text-sky-400 font-bold bg-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-medium'
              }`}
            >
              <div className="relative pointer-events-none">
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px] scale-110 text-sky-400' : 'stroke-[1.75px]'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-1 leading-none tracking-tight text-center truncate max-w-[42px] sm:max-w-[70px] pointer-events-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 sm:w-8 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
