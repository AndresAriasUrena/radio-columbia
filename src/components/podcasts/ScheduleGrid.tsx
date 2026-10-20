'use client';

import { useEffect, useMemo, useState } from 'react';
import { SCHEDULE, ScheduleBlock } from '@/lib/schedule';

// Índice de día (0 = lunes) y minutos desde medianoche, en hora de Costa Rica
function getNowInCostaRica() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Costa_Rica',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    dayIndex: Math.max(0, days.indexOf(get('weekday'))),
    minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10),
  };
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const formatTime = (t: string) => {
  let [h, m] = t.split(':').map(Number);
  if (h === 24) h = 0;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export default function ScheduleGrid() {
  const [now, setNow] = useState<{ dayIndex: number; minutes: number } | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const current = getNowInCostaRica();
    setNow(current);
    setSelected(current.dayIndex);
    const id = setInterval(() => setNow(getNowInCostaRica()), 60_000);
    return () => clearInterval(id);
  }, []);

  const day = SCHEDULE[selected];
  const isToday = now?.dayIndex === selected;

  const liveIndex = useMemo(() => {
    if (!isToday || !now) return -1;
    return day.blocks.findIndex(
      (blk: ScheduleBlock) => now.minutes >= toMinutes(blk.start) && now.minutes < toMinutes(blk.end)
    );
  }, [day, isToday, now]);

  return (
    <section id="schedule" className="max-w-7xl mx-auto py-4">
      <div className="bg-[#F8FBFF] rounded-3xl p-5 sm:p-8">
        <h2 className="font-semibold text-xl mb-2 uppercase text-[#1E305F]">Programación</h2>
        <p className="text-sm text-[#2F3037]/60">
          Horario de Costa Rica. La programación está sujeta a cambios.
        </p>
        <div className="h-0.5 w-full bg-[#D51F2F] my-4" />

        <div role="tablist" aria-label="Día de la semana" className="flex flex-wrap gap-2 mb-6">
          {SCHEDULE.map((d, i) => {
            const active = i === selected;
            return (
              <button
                key={d.key}
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(i)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#D51F2F] text-white'
                    : 'bg-white text-[#1E305F] border border-[#D4D5DD] hover:border-[#D51F2F] hover:text-[#D51F2F]'
                }`}
              >
                <span className="sm:hidden">{d.short}</span>
                <span className="hidden sm:inline">{d.label}</span>
                {now?.dayIndex === i && (
                  <span className={`ml-2 text-[0.65rem] uppercase ${active ? 'text-white/80' : 'text-[#01A299]'}`}>
                    Hoy
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {day.blocks.map((blk, i) => {
            const live = i === liveIndex;
            return (
              <div
                key={`${blk.start}-${i}`}
                className={`rounded-xl px-4 py-3 border transition-colors ${
                  live ? 'bg-[#1E305F] border-[#1E305F] text-white' : 'bg-white border-[#D4D5DD] text-[#2F3037]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-medium ${live ? 'text-white/80' : 'text-[#2F3037]/60'}`}>
                    {formatTime(blk.start)} – {formatTime(blk.end)}
                  </span>
                  {live && (
                    <span className="text-[0.65rem] font-semibold uppercase bg-[#D51F2F] text-white rounded-full px-2 py-0.5">
                      Al aire
                    </span>
                  )}
                </div>
                <div className={`font-semibold text-sm mt-1 ${live ? 'text-white' : 'text-[#1E305F]'}`}>
                  {blk.show}
                </div>
                <div className={`text-xs mt-1 ${live ? 'text-white/80' : 'text-[#2F3037]/60'}`}>
                  {blk.producer} · {blk.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
