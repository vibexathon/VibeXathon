
import React, { useState, useEffect, useCallback } from 'react';
import { CountdownTime } from '../types';

const CountdownTimer: React.FC = () => {
  // Set target date to March 16, 2026, at 10:00 AM (Month is 0-indexed, so 2 is March)
  const targetDate = new Date(2026, 2, 16, 10, 0, 0).getTime();

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center group">
      <div className="text-4xl sm:text-7xl font-black text-white tabular-nums tracking-tighter group-hover:scale-105 transition-transform duration-300">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
        {label}
      </div>
    </div>
  );

  const Separator = () => (
    <div className="text-3xl sm:text-5xl font-thin text-slate-800 self-start mt-2 sm:mt-4 mx-2 sm:mx-4">:</div>
  );

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Unit value={timeLeft.days} label="Days" />
      <Separator />
      <Unit value={timeLeft.hours} label="Hours" />
      <Separator />
      <Unit value={timeLeft.minutes} label="Mins" />
      <Separator />
      <Unit value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

export default CountdownTimer;
