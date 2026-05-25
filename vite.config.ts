import React, { useState } from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { Dices, Check, Clock, Minus, Plus } from 'lucide-react';
import { cn, getBusinessDate, formatDateTime } from '../../lib/utils';

export function GuestGamePage() {
  const { users, currentUser, gameSessions, startChinchiroGame, customerStamps, attendanceRequests, shiftRequests } = useMockApp();
  const [selectedBet, setSelectedBet] = useState<number>(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const myPointsHistory = customerStamps.filter(s => s.customerMemberId === currentUser.id);
  const totalPoints = myPointsHistory.reduce((acc, curr) => acc + (curr.points !== undefined ? curr.points : (curr.type === 'spend' ? -1 : 1)), 0);

  const MAX_PLAYS = currentUser.gamePlaysLimit ?? 4;
  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const getSafeTime = (date: any) => {
    if (!date) return Date.now();
    if (date instanceof Date) return date.getTime();
    if (typeof date.toDate === 'function') return date.toDate().getTime();
    try {
      return new Date(date).getTime();
    } catch {
      return Date.now();
    }
  };

  const myRecentGames = gameSessions.filter(g => g.customerMemberId === currentUser.id && getSafeTime(g.startedAt) >= last24h && g.status !== 'canceled');
  const gamesCount = myRecentGames.length;
  const remainingPlays = Math.max(0, MAX_PLAYS - gamesCount);

  // Determine working employees (admin, staff, cast)
  const today = getBusinessDate();
  const targetShift = shiftRequests.find(s => s.businessDate === today && !s.isDeleted && s.status !== 'canceled');
  const validShiftsForToday = targetShift ? [targetShift.id] : [];

  const currentWorkingUsers = new Set(
    attendanceRequests
      .filter(a => validShiftsForToday.includes(a.shiftRequestId) && (a.status === 'present' || a.status === 'late' || a.status === 'leave_early'))
      .map(a => a.userId)
  );

  const targetEmployees = users.filter(u => {
    if (u.isDeleted || u.approvalStatus !== 'approved') return false;
    if (u.role === 'customer') return false;
    return currentWorkingUsers.has(u.id);
  });

  const betOptions = [1, 2, 3, 5];

  const handleStartGame = async () => {
    if (!selectedEmployeeId) {
      setErrorMsg('挑戦相手を選択してください。');
      return;
    }
    if (selectedBet > totalPoints) {
      setErrorMsg('ポイントが足りません。');
      return;
    }
    if (remainingPlays <= 0) {
      setErrorMsg('24時間以内の挑戦回数上限に達しました。');
      return;
    }

    setIsRolling(true);
    setErrorMsg(null);
    try {
      await startChinchiroGame(selectedEmployeeId, selectedBet);
      setSelectedEmployeeId('');
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsRolling(false);
    }
  };

  const getDiceDots = (num: number) => {
    const dotsArray = Array.from({ length: num });
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-8 h-8 md:w-12 md:h-12 bg-white rounded-md p-1">
        {Array.from({ length: 9 }).map((_, i) => {
          let hasDot = false;
          if (num === 1 && i === 4) hasDot = true;
          if (num === 2 && (i === 0 || i === 8)) hasDot = true;
          if (num === 3 && (i === 0 || i === 4 || i === 8)) hasDot = true;
          if (num === 4 && (i === 0 || i === 2 || i === 6 || i === 8)) hasDot = true;
          if (num === 5 && (i === 0 || i === 2 || i === 4 || i === 6 || i === 8)) hasDot = true;
          if (num === 6 && (i === 0 || i === 2 || i === 3 || i === 5 || i === 6 || i === 8)) hasDot = true;

          return (
            <div key={i} className="flex items-center justify-center">
              {hasDot && <div className={cn("w-2 h-2 rounded-full", num === 1 ? "bg-red-500" : "bg-black")} />}
            </div>
          );
        })}
      </div>
    );
  };

  const activeMyGames = gameSessions.filter(g => g.customerMemberId === currentUser.id).sort((a, b) => getSafeTime(b.startedAt) - getSafeTime(a.startedAt));

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-lux gold-gradient-text tracking-widest uppercase">Chinchiro</h2>
        <p className="text-xs text-gray-400">従業員とチンチロ勝負をしてポイントを増やそう！</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[#d4af37]/30 text-center space-y-4">
        <div>
          <span className="text-sm text-gray-400">現在の保有ポイント</span>
          <div className="font-lux text-4xl text-[#d4af37] drop-shadow-lg">{totalPoints}</div>
        </div>
        <div>
          <span className="text-xs text-gray-400">本日の挑戦回数</span>
          <div className="text-white text-lg">{gamesCount} / {MAX_PLAYS}回</div>
          {remainingPlays === 0 ? (
             <div className="text-xs text-red-400 mt-1">24時間以内の挑戦回数上限に達しました</div>
          ) : (
             <div className="text-xs text-green-400 mt-1">残り {remainingPlays} 回挑戦可能</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-2">1. ベットするポイントを選ぶ</h3>
        {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">{errorMsg}</div>}
        <div className="flex gap-2 justify-center flex-wrap">
          {betOptions.map(amount => (
             <button
               key={amount}
               onClick={() => setSelectedBet(amount)}
               disabled={amount > totalPoints}
               className={cn(
                 "w-16 h-16 rounded-xl border flex flex-col items-center justify-center transition",
                 selectedBet === amount ? "bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] scale-105" : "bg-black/50 border-white/10 text-gray-400",
                 amount > totalPoints && "opacity-30 cursor-not-allowed"
               )}
             >
               <span className="text-xl font-bold">{amount}</span>
               <span className="text-[10px]">pt</span>
             </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-2">2. 挑戦する相手を選ぶ</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {targetEmployees.length === 0 ? (
             <div className="col-span-full text-center text-gray-500 py-4">現在出勤中の従業員がいません</div>
          ) : (
            targetEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-2 transition text-center",
                  selectedEmployeeId === emp.id ? "bg-[#d4af37]/20 border-[#d4af37]" : "bg-black/50 border-white/10 hover:bg-white/5"
                )}
              >
                <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-black flex items-center justify-center">
                  {emp.iconUrl ? <img src={emp.iconUrl} className="w-full h-full object-cover" /> : <span className="text-gray-500 font-bold">{emp.displayName?.[0] || '?'}</span>}
                </div>
                <div className="text-white text-sm font-bold truncate w-full">{emp.displayName}</div>
                <div className="text-[10px] text-gray-500 uppercase">{emp.role}</div>
              </button>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleStartGame}
        disabled={isRolling || remainingPlays <= 0 || selectedBet > totalPoints || !selectedEmployeeId}
        className={cn(
          "w-full py-4 text-lg font-bold rounded-xl transition flex items-center justify-center gap-2",
          (isRolling || remainingPlays <= 0 || selectedBet > totalPoints || !selectedEmployeeId)
            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
            : "btn-gold shadow-lg"
        )}
      >
        <Dices size={24} />
        {isRolling ? 'サイコロを振る...' : 'ゲーム開始（サイコロを振る）'}
      </button>

      <div className="glass-panel p-4 rounded-xl border border-white/10">
        <h4 className="text-sm font-bold text-white mb-2 text-center">倍率（配当）ルール</h4>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300">
           <div className="bg-white/5 p-2 rounded">ピンゾロ (1,1,1): <span className="text-[#d4af37] font-bold">5倍</span></div>
           <div className="bg-white/5 p-2 rounded">ゾロ目: <span className="text-[#d4af37] font-bold">4倍</span></div>
           <div className="bg-white/5 p-2 rounded">シゴロ (4,5,6): <span className="text-[#d4af37] font-bold">3倍</span></div>
           <div className="bg-white/5 p-2 rounded">通常目: <span className="text-green-400 font-bold">2倍</span></div>
           <div className="bg-white/5 p-2 rounded">引き分け: <span className="text-gray-400 font-bold">返却(1倍)</span></div>
           <div className="bg-white/5 p-2 rounded">ヒフミ / 目なし / 敗北: <span className="text-red-400 font-bold">没収(0倍)</span></div>
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <h3 className="font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">
           <Clock size={16} /> 進行中・履歴
        </h3>
        
        {activeMyGames.length === 0 ? (
          <div className="text-center text-gray-500 py-8">履歴はありません</div>
        ) : (
          <div className="space-y-4">
            {activeMyGames.map(game => (
              <div key={game.id} className="glass-panel p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-xs text-gray-400">{formatDateTime(game.startedAt)}</div>
                  {game.status === 'employee_pending' ? (
                     <div className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-1 rounded-full border border-yellow-500/30">相手の対応待ち</div>
                  ) : game.status === 'canceled' ? (
                     <div className="bg-gray-500/20 text-gray-400 text-[10px] px-2 py-1 rounded-full border border-gray-500/30">キャンセル</div>
                  ) : (
                     <div className={cn("text-[10px] px-2 py-1 rounded-full border font-bold flex items-center gap-1", 
                        game.result === 'customer_win' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        game.result === 'employee_win' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-gray-500/20 text-gray-400 border-gray-500/30"
                     )}>
                        {game.result === 'customer_win' && '勝利！'}
                        {game.result === 'employee_win' && '敗北...'}
                        {game.result === 'draw' && '引き分け'}
                     </div>
                  )}
                </div>

                <div className="flex gap-4 justify-between items-center text-center">
                   {/* Customer side */}
                   <div className="flex-1 space-y-2">
                     <div className="text-sm font-bold text-white">あなた</div>
                     <div className="flex gap-1 justify-center">
                        {getDiceDots(game.customerDie1)}
                        {getDiceDots(game.customerDie2)}
                        {getDiceDots(game.customerDie3)}
                     </div>
                     <div className="text-xs text-[#d4af37] font-bold">{game.customerHand}</div>
                   </div>

                   <div className="text-2xl font-black text-gray-700">VS</div>

                   {/* Employee side */}
                   <div className="flex-1 space-y-2">
                     <div className="text-sm font-bold text-white">{game.employeeNameSnapshot}</div>
                     {game.status === 'employee_pending' ? (
                        <div className="text-gray-500 text-xs py-4 flex flex-col items-center"><Clock size={16} className="mb-1 animate-spin" />考え中...</div>
                     ) : game.status === 'completed' && game.employeeDie1 ? (
                        <>
                          <div className="flex gap-1 justify-center">
                             {getDiceDots(game.employeeDie1)}
                             {getDiceDots(game.employeeDie2)}
                             {getDiceDots(game.employeeDie3)}
                          </div>
                          <div className="text-xs text-[#d4af37] font-bold">{game.employeeHand}</div>
                        </>
                     ) : (
                        <div className="text-gray-500 text-xs py-4">無効</div>
                     )}
                   </div>
                </div>

                <div className="bg-black/50 p-3 rounded-lg border border-white/5 flex justify-between items-center text-sm">
                   <div className="text-gray-400 border-r border-white/10 pr-4">ベット: <span className="text-white font-bold">{game.betPoints}pt</span></div>
                   {(game.status === 'completed' || game.status === 'canceled') && (
                      <div className="flex-1 text-right pl-4 space-x-2">
                        {game.status === 'canceled' ? (
                           <span className="text-gray-400">キャンセルされました</span>
                        ) : game.result === 'customer_win' ? (
                           <>
                             <span className="text-[#d4af37]">配当({game.payoutMultiplier}倍):</span>
                             <span className="text-green-400 font-bold text-lg">+{game.payoutPoints}pt</span>
                           </>
                        ) : game.result === 'draw' ? (
                           <>
                             <span className="text-gray-400">返却(1倍):</span>
                             <span className="text-white font-bold text-lg">+{game.payoutPoints}pt</span>
                           </>
                        ) : (
                           <>
                             <span className="text-red-400">没収:</span>
                             <span className="text-red-400 font-bold text-lg">- {game.betPoints}pt</span>
                           </>
                        )}
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
