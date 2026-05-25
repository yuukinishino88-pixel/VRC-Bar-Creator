import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useMockApp, UserRole } from '../../lib/MockAppContext';
import { Wine, LogOut, BellRing, Settings, User, ChevronUp, ChevronDown, Book, Star, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RotationLabel } from '../ui/RotationLabel';
import { EmergencyCallNotification } from '../ui/EmergencyCallNotification';
import { EmergencyHelpButton } from '../ui/EmergencyHelpButton';

export function AppLayout() {
  const { currentUser, logout, currentRotationNumber, announcements, users, isAuthReady, isProfileLoading, eventStatus } = useMockApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const pendingUsersCount = users.filter(u => u.approvalStatus === 'pending' && !u.isDeleted).length;

  // Auto-hide navigation after 3 seconds of no interaction
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isNavOpen && !isHovered) {
      timeoutId = setTimeout(() => {
        setIsNavOpen(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isNavOpen, isHovered]);

  const activeAnnouncements = announcements ? announcements.filter(a => a.isActive).sort((a, b) => {
    const priority = { emergency: 3, important: 2, normal: 1 };
    return priority[b.type] - priority[a.type];
  }) : [];
  const topAnnouncement = activeAnnouncements.length > 0 ? activeAnnouncements[0] : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if we are on auth screens or opening animation
  const isAuthScreen = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/opening';
  const isEmployee =
  currentUser?.role === 'admin' ||
  currentUser?.role === 'staff' ||
  currentUser?.role === 'cast';

const isCustomer = currentUser?.role === 'customer';

  // Safety redirect if stuck and not on an auth screen
  useEffect(() => {
    if (!isAuthReady || isAuthScreen) return;
    
    const timer = setTimeout(() => {
      if (!currentUser && location.pathname === '/') {
        // If still no user at root after 3s, let ProtectedRoute or local logic handle it
        // Or we can force navigate to login if we want it private
        // navigate('/login'); 
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentUser, isAuthReady, isAuthScreen, location.pathname, navigate]);

  if (isAuthScreen) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-x-hidden">
        <Outlet />
      </div>
    );
  }

  if (!isAuthReady || isProfileLoading) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex items-center justify-center">
      <div className="text-center">
        <Wine className="mx-auto text-[#d4af37] mb-4" size={32} />
        <p className="text-sm text-gray-400 tracking-widest">
          ログイン情報を確認中...
        </p>
      </div>
    </div>
  );
}

if (!currentUser) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-400">ログイン情報を確認できませんでした。</p>
        <Link to="/login" className="btn-gold px-5 py-2 rounded-full text-sm font-bold">
          ログインへ
        </Link>
      </div>
    </div>
  );
}

  // Debug info for development
  const showDebug = import.meta.env.DEV;

  if (currentUser?.isDeleted) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6 animate-pulse">
          <Wine size={40} className="rotate-180" />
        </div>
        <h2 className="text-2xl font-lux gold-gradient-text mb-4 uppercase tracking-[0.2em]">Account Disabled</h2>
        <div className="glass-panel p-6 rounded-2xl border border-red-500/30 max-w-sm">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            このアカウントは管理者によって停止、または削除されました。
          </p>
          {currentUser.deleteReason && (
            <div className="text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg border border-red-500/20 mb-6">
              理由: {currentUser.deleteReason}
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:bg-[#b89830] transition shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            戻る
          </button>
        </div>
        <p className="mt-8 text-[11px] text-gray-500 tracking-[0.3em] font-light">NAKIYA_BAR SYSTEM CONTROL</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-x-hidden flex flex-col">
      {/* Enhanced Debug HUD - Only in Dev */}
      {showDebug && (
        <div className="fixed bottom-0 right-0 p-2 bg-black/95 border-t border-l border-[#d4af37]/30 z-[9999] font-mono text-[11px] space-y-1 pointer-events-none select-none max-w-[200px]">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">AUTH:</span>
            <span className={isAuthReady ? "text-green-500" : "text-red-500"}>{isAuthReady ? 'READY' : 'PENDING'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">USER:</span>
            <span className={currentUser ? "text-blue-400" : "text-gray-600"}>{currentUser?.userCode || 'guest'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">ROLE:</span>
            <span className="text-[#d4af37] font-bold">{currentUser?.role || 'none'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">STATUS:</span>
            <span className="tracking-widest capitalize">{currentUser?.approvalStatus || 'none'}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1">
            <span className="text-gray-500 uppercase">Event:</span>
            <span className="text-white uppercase truncate">{eventStatus}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 uppercase">Rot:</span>
            <span className="text-white">{currentRotationNumber || '-'}</span>
          </div>
          <div className="text-[8px] text-white/30 pt-1">
            PATH: {location.pathname}
          </div>
        </div>
      )}
      <EmergencyCallNotification />
      <EmergencyHelpButton />
      {/* Announcement Bar */}
      <div className={cn(
        "w-full text-white text-center py-2 px-4 shadow-[0_0_15px_rgba(123,17,19,0.5)] z-50 relative text-sm font-medium tracking-wider flex items-center justify-center gap-2",
        topAnnouncement?.type === 'emergency' ? "bg-red-800" :
        topAnnouncement?.type === 'important' ? "bg-yellow-700" :
        "bg-[linear-gradient(90deg,#4e070c,#7b1113,#4e070c)]"
      )}>
        <BellRing size={16} className={cn(topAnnouncement?.type === 'emergency' ? "text-white" : "text-[#d4af37]")} />
        <span className="flex-1 text-center truncate">{topAnnouncement ? topAnnouncement.title : `本日はNakiya_Barへようこそ。特別な夜をお楽しみください。`}</span>
        <span className="flex items-center gap-1 opacity-90"><span className="hidden sm:inline">現在: </span><RotationLabel rotationNumber={currentRotationNumber} /></span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 glass-panel border-x-0 border-t-0 border-b border-[#d4af37]/20 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app')}>
          <Wine className="text-[#d4af37]" size={28} />
          <h1 className="font-lux text-2xl tracking-widest gold-gradient-text uppercase font-semibold">
            Nakiya_Bar
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
               <Link to="/app/order" className="btn-gold px-4 py-1.5 rounded-full text-xs font-bold mr-2 flex items-center gap-2">
                 <Wine size={14} /> <span className="hidden sm:inline">注文する</span>
               </Link>
               <Link to="/app/profile" className="flex items-center gap-2 hover:bg-white/5 pr-2 rounded transition group">
                 {currentUser.iconUrl ? (
                   <img src={currentUser.iconUrl} alt="Icon" className="w-8 h-8 rounded-full border border-[#d4af37]/50 object-cover" />
                 ) : (
                   <div className="w-8 h-8 rounded-full border border-[#d4af37]/50 bg-black flex items-center justify-center text-[#d4af37]">
                     <User size={16} />
                   </div>
                 )}
                 <div className="text-xs text-gray-400 hidden sm:block group-hover:text-white transition">
                   {currentUser.displayName} <span className="opacity-70">({currentUser.role})</span>
                 </div>
               </Link>
               <button onClick={handleLogout} className="text-gray-400 hover:text-white transition ml-2">
                 <LogOut size={26} />
               </button>
            </>
          ) : (
            <Link to="/login" className="btn-outline-gold px-4 py-1.5 rounded-full text-xs flex items-center gap-2">
              <User size={14} /> ログイン
            </Link>
          )}
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-md mx-auto sm:max-w-4xl p-4 sm:p-6 lg:p-8 pb-32 flex-1 w-full">
        <Outlet />
      </main>

      {/* Bottom Nav for mobile / specific actions */}
      <div 
        className={cn(
          "fixed bottom-0 w-full z-40 transition-transform duration-300 ease-in-out",
          (isNavOpen || isHovered) ? "translate-y-0" : "translate-y-[calc(100%-10px)]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!isNavOpen) setIsNavOpen(true);
        }}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsNavOpen(!isNavOpen);
          }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-7 glass-panel border-t border-x border-[#d4af37]/40 rounded-t-xl flex justify-center items-center text-[#d4af37] hover:bg-white/5 transition pb-1"
        >
          {isNavOpen || isHovered ? <ChevronDown size={26} /> : <ChevronUp size={26} />}
        </button>
        {currentUser?.approvalStatus === 'approved' && (
          <footer className="w-full glass-panel border-t border-[#d4af37]/20 flex flex-wrap justify-center gap-4 sm:gap-6 py-3 pb-safe pt-4 bg-[#050505]/80 overflow-x-auto custom-scrollbar px-2">
      <Link
        to="/app"
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300",
          location.pathname === '/app' ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
        onClick={() => setIsNavOpen(false)}
      >
        <Wine size={28} className={cn(location.pathname === '/app' && "animate-pulse")} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider">HOME</span>
      </Link>

      <Link
        to="/app/staff"
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300",
          location.pathname.includes('/app/staff') ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
        onClick={() => setIsNavOpen(false)}
      >
        <BellRing size={28} className={cn(location.pathname.includes('/app/staff') && "animate-pulse")} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider">ORDERS</span>
      </Link>

      <Link
        to="/app/placement"
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300",
          location.pathname === '/app/placement' ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
        onClick={() => setIsNavOpen(false)}
      >
        <User size={28} className={cn(location.pathname === '/app/placement' && "animate-pulse")} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider">配 置 一 覧</span>
      </Link>

      <Link
        to="/app/recipes"
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300",
          location.pathname === '/app/recipes' ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
        onClick={() => setIsNavOpen(false)}
      >
        <Book size={28} className={cn(location.pathname === '/app/recipes' && "animate-pulse")} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider">レシピ</span>
      </Link>

      <Link
        to="/app/members"
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300",
          location.pathname === '/app/members' ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
        onClick={() => setIsNavOpen(false)}
      >
        <Star size={28} className={cn(location.pathname === '/app/members' && "animate-pulse")} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider">会 員</span>
      </Link>

      <Link
        to="/app/attendance"
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300",
          location.pathname.includes('/app/attendance') ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        )}
        onClick={() => setIsNavOpen(false)}
      >
        <Calendar size={28} className={cn(location.pathname.includes('/app/attendance') && "animate-pulse")} />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider">出 勤</span>
      </Link>

      {(currentUser?.role === 'admin' || currentUser?.userCode === 'minatoto' || currentUser?.loginId === 'minatoto1112' || currentUser?.loginId === 'minatoto_1112') && (
        <Link
          to="/app/admin"
          className={cn(
            "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[72px] transition-all duration-300 relative",
            location.pathname.includes('/app/admin') ? "text-[#d4af37] bg-[#d4af37]/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          )}
          onClick={() => setIsNavOpen(false)}
        >
          <Settings size={28} className={cn(location.pathname.includes('/app/admin') && "animate-pulse")} />
          <span className="text-[11px] sm:text-xs font-bold tracking-wider">ADMIN</span>
          {pendingUsersCount > 0 && (
            <span className="absolute top-2 right-4 w-2.5 h-2.5 bg-red-600 rounded-full border border-[#050505] animate-pulse"></span>
          )}
        </Link>
      )}
    </footer>
        )}
      </div>
    </div>
  );
}
