import React from 'react';
import { UserProfile } from '../types';
import { Calendar, History, BarChart2, Settings, Plus, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: 'schedule' | 'timeline' | 'statistics' | 'settings';
  setActiveTab: (tab: 'schedule' | 'timeline' | 'statistics' | 'settings') => void;
  user: UserProfile;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { key: 'schedule' as const, label: 'Schedule', icon: Calendar },
    { key: 'timeline' as const, label: 'Timeline', icon: History },
    { key: 'statistics' as const, label: 'Statistics', icon: BarChart2 },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="h-full w-64 fixed left-0 top-0 flex flex-col border-r border-outline-variant bg-surface-bright shadow-sm z-50">
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary mb-1 tracking-tight">
          Study Planner
        </h1>
        <p className="font-mono text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">
          Academic Focus
        </p>
      </div>

      {/* Navigation list */}
      <div className="px-3 flex-grow mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <button
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Content */}
      <div className="p-6 mt-auto border-t border-outline-variant/50">
        <button
          onClick={() => setActiveTab('schedule')}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer active:scale-[0.98] shadow-sm mb-6"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>

        {/* User profile card */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-primary/10"
              src={user.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface truncate">
                {user.name}
              </p>
              <p className="font-mono text-[10px] text-on-surface-variant truncate uppercase tracking-widest">
                {user.membership}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            title="Logout"
            className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-surface-container-high cursor-pointer flex justify-center items-center shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
