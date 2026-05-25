import React from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { Wine, LogOut, Ticket, Star, UserCircle, Users, Home, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RotationLabel } from '../ui/RotationLabel';

export function CustomerLayout() {
  const { currentUser, logout, eventStatus, currentRotationNumber, announcements } = useMockApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/guest-login');
  };

  const activeAnnouncements = announcements ? announcements.filter(a => a.isActive && (a.targetRole === 'all' || a.targetRole === 'customer')).sort((a, b) => {
    const priority = { emergency: 3, important: 2, normal: 1 };
    return priority[b.type] - priority[a.type];
  }) : [];
  const topAnnouncement = activeAnnouncements.length > 0 ? activeAnnouncements[0] : null;

  const navItems = [
    { path: '/guest', icon: Home, label: 'ホーム' },
    { path: '/guest/casts', icon: Users, label: 'キャスト' },
    { path: '/guest/menu', icon: BookOpen, label: 'メニュー' },
    { path: '/guest/lottery', icon: Ticket, label: '抽選' },
    { path: '/guest/game', icon: Star, label: 'ゲーム' },
    { path: '/guest/point', icon: UserCircle, label: 'ポイント' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col">
      {/* Announcement Bar */}
      {topAnnouncement && (
        <div className={cn(
          "w-full text-white text-center py-2 px-4 z-50 relative text-sm font-medium tracking-wider flex items-center justify-center gap-2",
          topAnnouncement.type === 'emergency' ? "bg-red-800" :
          topAnnouncement.type === 'important' ? "bg-yellow-700" :
          "bg-[linear-gradient(90deg,#4e070c,#7b1113,#4e070c)]"
        )}>
          <span className="flex-1 text-center truncate">{topAnnouncement.title}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#d4af37]/20 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Wine className="text-[#d4af37]" size={24} />
          <h1 className="font-lux text-xl tracking-widest gold-gradient-text uppercase font-semibold">
            Nakiya_Bar
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#d4af37] border border-[#d4af37]/30 px-2 py-1 rounded hidden sm:block">
            <RotationLabel rotationNumber={currentRotationNumber} />
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition p-2">
            <LogOut size={26} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto sm:max-w-4xl p-4 pb-24 flex-1 w-full relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-black/90 backdrop-blur-lg border-t border-[#d4af37]/20 pb-safe">
        <nav className="flex justify-around items-center max-w-md mx-auto sm:max-w-4xl px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/guest' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl min-w-[64px] transition-all duration-300",
                  isActive ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <item.icon size={28} className={cn(isActive && "animate-pulse")} />
                <span className="text-[11px] sm:text-xs font-bold tracking-wider">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  );
}
