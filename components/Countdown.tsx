
import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownProps {
  deadline: number;
  label: string;
  onFinish?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ deadline, label, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        if (onFinish) onFinish();
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onFinish]);

  if (!timeLeft) return null;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px]">
      <div className="flex items-center gap-2 text-primary-400 mb-1">
        <Timer size={16} className="animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex gap-2 font-mono text-xl font-black">
        <div className="flex flex-col items-center">
          <span>{timeLeft.h.toString().padStart(2, '0')}</span>
          <span className="text-[8px] opacity-50 -mt-1">H</span>
        </div>
        <span className="opacity-30">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.m.toString().padStart(2, '0')}</span>
          <span className="text-[8px] opacity-50 -mt-1">M</span>
        </div>
        <span className="opacity-30">:</span>
        <div className="flex flex-col items-center text-primary-500">
          <span>{timeLeft.s.toString().padStart(2, '0')}</span>
          <span className="text-[8px] opacity-50 -mt-1 text-primary-500">S</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
