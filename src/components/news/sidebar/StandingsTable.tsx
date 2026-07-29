"use client";

import { useEffect, useState } from 'react';

interface StandingRow {
  pos: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

export default function StandingsTable() {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/standings');
        const data = await res.json();
        if (!ignore && data?.rows) setRows(data.rows);
      } catch {
        if (!ignore) setRows([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { ignore = true; clearInterval(id); };
  }, []);

  if (loading) {
    return <div className="text-[#D4D5DD] text-sm">Cargando tabla de posiciones...</div>;
  }

  if (rows.length === 0) {
    return <div className="text-[#D4D5DD] text-sm">Tabla de posiciones no disponible.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-[#FFFFFF]/10">
      <table className="w-full text-sm text-[#D4D5DD]">
        <thead>
          <tr className="text-xs opacity-70">
            <th className="text-left font-normal px-3 py-2">#</th>
            <th className="text-left font-normal px-3 py-2">Equipo</th>
            <th className="text-center font-normal px-2 py-2">PJ</th>
            <th className="text-center font-normal px-2 py-2">G</th>
            <th className="text-center font-normal px-2 py-2">E</th>
            <th className="text-center font-normal px-2 py-2">P</th>
            <th className="text-center font-normal px-3 py-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.pos} className="border-t border-[#FFFFFF]/10">
              <td className="px-3 py-2">{r.pos}</td>
              <td className="px-3 py-2 truncate max-w-[120px]">{r.team}</td>
              <td className="text-center px-2 py-2">{r.played}</td>
              <td className="text-center px-2 py-2">{r.wins}</td>
              <td className="text-center px-2 py-2">{r.draws}</td>
              <td className="text-center px-2 py-2">{r.losses}</td>
              <td className="text-center px-3 py-2 font-semibold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
