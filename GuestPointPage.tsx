import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMockApp } from '../../lib/MockAppContext';
import { OpeningDoor } from '../../components/opening/OpeningDoor';
import { Loader2 } from 'lucide-react';

type Phase = 'door-closed' | 'door-opening' | 'reveal' | 'clink' | 'finish';

export function OpeningAnimation() {
  const { currentUser, setHasSeenOpening, isProfileLoading, hasSeenOpening } = useMockApp();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('door-closed');

  useEffect(() => {
    // If already seen, go to home immediately
    if (hasSeenOpening && currentUser) {
      handleComplete();
      return;
    }

    // If profile is loading, wait
    if (isProfileLoading) return;

    // Safety redirect: if not logged in, go to login
    if (!currentUser) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }

    const sequence = async () => {
      // 1. Show door closed (1.5s for visibility)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('door-opening');

      // 2. Door starts opening (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('reveal');

      // 3. Clink effect (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('clink');

      // 4. Logo / Finish (1.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('finish');

      // 5. Final transition (0.5s)
      await new Promise(resolve => setTimeout(resolve, 500));
      handleComplete();
    };

    sequence();

    // BLACKOUT PREVENTION: Max 12s transition as requested
    const safetyTimeout = setTimeout(() => {
      handleComplete();
    }, 12000);

    // Event listeners for skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'Escape'].includes(e.key)) {
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(safetyTimeout);
    };
  }, [currentUser, isProfileLoading, navigate]);

  const handleComplete = () => {
    setHasSeenOpening(true);
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Role-based redirection as per specs
    if (currentUser.isDeleted) {
      navigate('/app/deleted');
    } else if (currentUser.role === 'customer') {
      navigate('/guest');
    } else if (currentUser.approvalStatus === 'pending') {
      navigate('/app/pending');
    } else if (currentUser.approvalStatus === 'rejected') {
      navigate('/app/rejected');
    } else if (currentUser.role === 'admin') {
      navigate('/app/admin');
    } else if (currentUser.role === 'staff' || currentUser.role === 'cast') {
      navigate('/app/staff');
    } else {
      navigate('/app');
    }
  };

  if (isProfileLoading || !currentUser) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#d4af37]" />
        <div className="text-xs font-lux text-[#d4af37]/60 tracking-[0.4em] uppercase">Authenticating...</div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-[#050505] z-[100] flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleComplete}
    >
      {/* Background Ambience: visible deep in the back */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(78,7,12,0.4),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,175,55,0.1),transparent)] pointer-events-none"></div>

      {/* Door Component */}
      <OpeningDoor isOpen={phase !== 'door-closed'} />
      
      <AnimatePresence mode="wait">
        {(phase === 'reveal' || phase === 'clink' || phase === 'finish') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, transition: { duration: 1.5 } }}
            className="relative w-full h-full flex flex-col items-center justify-center z-10"
          >
            {/* Silhouettes - Elegant Male & Female Hosts behind the door */}
            <div className="relative w-full h-full flex items-center justify-center opacity-80 mix-blend-overlay">
                <motion.div 
                   initial={{ x: -100, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="absolute left-[35%] bottom-0 h-4/5 w-1/4 pointer-events-none"
                >
                    {/* Artistic Silhouette Shape */}
                    <div className="w-full h-full glass-silhouette-male"></div>
                </motion.div>
                <motion.div 
                   initial={{ x: 100, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="absolute right-[35%] bottom-0 h-4/5 w-1/4 pointer-events-none"
                >
                    {/* Artistic Silhouette Shape */}
                    <div className="w-full h-full glass-silhouette-female"></div>
                </motion.div>
            </div>

            {/* Clink Flash / Glass Effect */}
            {phase === 'clink' && (
                <motion.div 
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                   transition={{ duration: 0.8 }}
                   className="absolute z-40 w-64 h-64 bg-[#d4af37] rounded-full blur-[80px]"
                />
            )}

            {/* Final Logo reveal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: phase === 'finish' ? 1 : 0.4, y: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-center z-50 pointer-events-none px-4"
            >
              <h2 className="font-lux text-5xl md:text-8xl gold-gradient-text tracking-[0.4em] uppercase mb-6 drop-shadow-[0_0_40px_rgba(212,175,55,0.5)]">
                Nakiya_Bar
              </h2>
              <motion.p 
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-[#d4af37]/60 text-[10px] md:text-xs tracking-[1.5em] uppercase"
              >
                Exclusive Night Management
              </motion.p>
            </motion.div>

            {/* Elegant Light Beams */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#d4af37]/40 text-[10px] uppercase tracking-[0.5em] font-light animate-pulse select-none z-50">
        Tap to Skip
      </div>

      {/* Decorative Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "110%",
              opacity: 0
            }}
            animate={{ 
              y: "-10%",
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-0.5 h-0.5 bg-[#d4af37]/40 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
