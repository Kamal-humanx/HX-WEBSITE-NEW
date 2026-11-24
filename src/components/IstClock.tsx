"use client";

import { useEffect, useState } from "react";

const fmt = (d: Date, seconds: boolean) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(d);

/** Live Mumbai time — Figma shows a static sample ("IST 10:51:10"); the design intent is a live clock. */
export function IstClock({ seconds = true, className = "" }: { seconds?: boolean; className?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt(new Date(), seconds));
    tick();
    const id = window.setInterval(tick, seconds ? 1000 : 30000);
    return () => window.clearInterval(id);
  }, [seconds]);
  return (
    <p className={className}>
      IST <time suppressHydrationWarning>{now ?? (seconds ? "--:--:--" : "--:--")}</time>
    </p>
  );
}
