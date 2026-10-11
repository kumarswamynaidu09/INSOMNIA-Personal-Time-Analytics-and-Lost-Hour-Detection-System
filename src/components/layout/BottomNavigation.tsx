import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { Home, Clock3, AlertCircle, User } from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Clock3 },
  { id: 'lost-hours', label: 'Lost Hours', icon: AlertCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, daySummary } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-lg">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="grid grid-cols-4 gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-[#0F172A] font-extrabold'
                    : 'text-[#64748B] hover:text-[#0F172A] font-medium'
                }`}
              >
                {/* Active Indicator Background Pill */}
                {isActive && (
                  <span className="absolute inset-x-2 inset-y-1 bg-[#F1F5F9] rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
                )}

                {/* Icon with optional badge for Lost Hours */}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 text-[#0F172A]' : 'text-[#64748B]'
                    }`}
                  />
                  {item.id === 'lost-hours' && daySummary.recoverableMinutes > 0 && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#EAB308] ring-2 ring-white" />
                  )}
                </div>

                <span
                  className={`text-[11px] mt-1 tracking-tight ${
                    isActive ? 'text-[#0F172A]' : 'text-[#64748B]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Yellow active micro-dot for INSOMNIA brand signature */}
                {isActive && (
                  <span className="w-1.5 h-1 rounded-full bg-[#FACC15] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
