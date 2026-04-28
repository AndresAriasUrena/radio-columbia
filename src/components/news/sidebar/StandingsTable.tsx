"use client";

import { useEffect, useRef } from 'react';

export default function StandingsTable() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const script = document.createElement('script');
    script.src = 'https://widgets.365scores.com/main.js';
    script.async = true;
    ref.current.appendChild(script);
  }, []);

  return (
    <div className="mb-8 overflow-hidden rounded-2xl">
      <div ref={ref}>
        <div
          data-widget-type="entityStandings"
          data-entity-type="league"
          data-entity-id="5056"
          data-lang="es-es"
          data-widget-id="e33c8337-d1dd-4bb1-b87e-abf3afe4ef7c"
        />
      </div>
    </div>
  );
}
