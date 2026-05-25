import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { ShieldAlert, Loader2, LogOut, Home, Lock } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { currentUser, logout, isAuthReady, isProfileLoading, profileError, hasSeenOpening } = useMockApp();
  const navigate = useNavigate();
  const location = useLocation();

  

  // Initial animation check
// 一旦停止：初回ログイン後の下部バー遷移でログイン画面へ戻る原因切り分け
// useEffect(() => {
//   if (!isProfileLoading && currentUser && !hasSeenOpening && location.pathname !== '/opening') {
//     navigate('/opening');
//   }
// }, [currentUser, hasSeenOpening, navigate, location.pathname, isProfileLoading]);

  // Loading state
  if (!isAuthReady || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-[#d4af37]" size={32} />
        <div className="text-sm font-lux tracking-widest uppercase">
          {!isAuthReady ? 'ログイン状態を確認中...' : 'プロフィールを確認中...'}
        </div>
      </div>
    );
  }

  // Profile error
  if (profileError && !currentUser) {
    if (['/login', '/register', '/guest-login', '/guest-register'].includes(location.pathname)) {
      return <>{children}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <ShieldAlert className="text-red-500 mb-2" size={48} />
        <h2 className="text-xl font-lux text-red-500 uppercase tracking-widest">Authentication Error</h2>
        <p className="text-sm text-gray-500 max-w-xs">{profileError}</p>
        <Link to="/login" className="btn-gold px-8 py-3 rounded-xl font-bold">ログイン画面へ</Link>
      </div>
    );
  }

  // Not logged in
if (!currentUser) {
  if (['/login', '/register', '/guest-login', '/guest-register'].includes(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
      <Loader2 className="animate-spin text-[#d4af37]" size={32} />
      <div className="text-sm font-lux tracking-widest uppercase">
        ログイン情報を確認中...
      </div>
      <Link to="/login" className="text-xs text-[#d4af37] underline mt-2">
        ログイン画面へ戻る
      </Link>
    </div>
  );
}

  // Deleted state handled by AppLayout, but let's show a minimal UI if reached
  if (currentUser.isDeleted) {
    return (
      <div className="flex flex-col items-center py-20 text-center px-6">
         <ShieldAlert className="text-red-500 mb-4" size={48} />
         <h2 className="text-xl font-lux text-red-500 uppercase tracking-widest">アカウントが無効です</h2>
         <p className="text-sm text-gray-500 mt-2">ログアウトして管理者にお問い合わせください。</p>
         <button onClick={() => logout()} className="mt-6 text-[#d4af37] border-b border-[#d4af37] py-1">ログアウト</button>
      </div>
    );
  }

  // Pending approval
  if (currentUser.approvalStatus === 'pending' && location.pathname !== '/pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <Loader2 className="text-yellow-500 animate-spin" size={48} />
        <h2 className="text-xl font-lux gold-gradient-text uppercase tracking-widest">承認待ち</h2>
        <p className="text-sm text-gray-500 max-w-xs">あなたのアカウントは現在管理者の承認待ちです。承認されるまでお待ちください。</p>
        <div className="flex gap-4">
            <Link to="/profile" className="btn-outline-gold px-6 py-2 rounded-lg text-xs">プロフィールの確認</Link>
            <button onClick={() => logout()} className="text-gray-500 hover:text-white transition text-xs flex items-center gap-2">
                <LogOut size={14} /> ログアウト
            </button>
        </div>
      </div>
    );
  }

  if (currentUser.approvalStatus === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <ShieldAlert className="text-red-500" size={48} />
        <h2 className="text-xl font-lux gold-gradient-text uppercase tracking-widest">承認が拒否されました</h2>
        <p className="text-sm text-gray-500 max-w-xs">残念ながら、あなたのアカウントの承認は拒否されました。スタッフにお問い合わせください。</p>
        <button onClick={() => logout()} className="btn-gold px-8 py-3 rounded-xl font-bold flex items-center gap-2">
            <LogOut size={18} /> ログアウト
        </button>
      </div>
    );
  }

  // Role check
  const userRole = currentUser.role as string;
  const isAuthorized = allowedRoles ? (
    allowedRoles.includes(userRole) || 
    (allowedRoles.includes('admin') && (currentUser.userCode === 'minatoto' || currentUser.loginId === 'minatoto_1112'))
  ) : true;

  if (allowedRoles && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
        <ShieldAlert className="text-red-500" size={48} />
        <h2 className="text-xl font-lux gold-gradient-text uppercase tracking-widest">アクセス権限がありません</h2>
        <div className="space-y-2 text-sm text-gray-500 max-w-xs">
          <p>このコンテンツを表示する権限がありません。</p>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-[10px] font-mono text-left space-y-1">
            <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
              <span className="text-gray-600">User ID:</span>
              <span>{currentUser.id}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
              <span className="text-gray-600">Role:</span>
              <span className="text-[#d4af37] font-bold">{currentUser.role}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
              <span className="text-gray-600">Approval:</span>
              <span>{currentUser.approvalStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Required:</span>
              <span className="text-blue-400">{allowedRoles.join(', ')}</span>
            </div>
          </div>
          <p className="text-[10px] opacity-50 italic">
            あなたが管理者の場合、一度ログアウトして再ログインするか、キャッシュをクリアしてください。
          </p>
        </div>
        <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="btn-outline-gold px-6 py-3 rounded-xl text-sm">戻る</button>
            <Link to="/" className="btn-gold px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                <Home size={18} /> ホームに戻る
            </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
