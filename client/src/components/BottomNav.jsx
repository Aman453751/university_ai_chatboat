import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, MessageSquare, Users, Settings } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/settings', label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-white/95 backdrop-blur-xl border-t border-gray-300 shadow-lg lg:hidden">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5 transition-colors ${
                active ? 'text-red-800 font-extrabold' : 'text-gray-700 hover:text-black font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px] text-red-800' : 'stroke-[2px]'}`} />
              <span className="font-label text-[10px] tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
