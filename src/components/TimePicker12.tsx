import React, { useState, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { parse24HourTo12, parse12HourTo24, formatTimeTo12Hour } from '../utils/timeFormat';

interface TimePicker12Props {
  id?: string;
  value: string; // "HH:mm" 24h format
  onChange: (value24: string) => void;
  label?: string;
  className?: string;
}

export const TimePicker12: React.FC<TimePicker12Props> = ({
  id,
  value,
  onChange,
  label,
  className = '',
}) => {
  const parsed = parse24HourTo12(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period);

  useEffect(() => {
    const p = parse24HourTo12(value);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  const updateTime = (newHour: number, newMin: number, newPeriod: 'AM' | 'PM') => {
    setHour(newHour);
    setMinute(newMin);
    setPeriod(newPeriod);
    const time24 = parse12HourTo24(newHour, newMin, newPeriod);
    onChange(time24);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = parseInt(e.target.value, 10);
    updateTime(h, minute, period);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value, 10);
    updateTime(hour, m, period);
  };

  const togglePeriod = (p: 'AM' | 'PM') => {
    if (period !== p) {
      updateTime(hour, minute, p);
    }
  };

  return (
    <div id={id} className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-input border border-white/60 dark:border-white/10">
        <div className="flex items-center pl-2 text-slate-400">
          <Clock className="w-4 h-4 text-indigo-500" />
        </div>

        {/* Hour Select */}
        <select
          aria-label="Hour"
          value={hour}
          onChange={handleHourChange}
          className="bg-transparent text-sm font-bold text-slate-900 dark:text-white px-1.5 py-1 rounded-lg focus:outline-none focus:bg-indigo-500/10 cursor-pointer"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {String(h).padStart(2, '0')}
            </option>
          ))}
        </select>

        <span className="font-bold text-slate-400">:</span>

        {/* Minute Select */}
        <select
          aria-label="Minute"
          value={minute}
          onChange={handleMinuteChange}
          className="bg-transparent text-sm font-bold text-slate-900 dark:text-white px-1.5 py-1 rounded-lg focus:outline-none focus:bg-indigo-500/10 cursor-pointer"
        >
          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
            <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {String(m).padStart(2, '0')}
            </option>
          ))}
        </select>

        {/* AM / PM Pill Toggles */}
        <div className="flex items-center ml-auto gap-0.5 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => togglePeriod('AM')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              period === 'AM'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => togglePeriod('PM')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              period === 'PM'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};
