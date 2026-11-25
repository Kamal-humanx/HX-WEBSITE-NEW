"use client";

import { useEffect, useState } from "react";

/**
 * Email link that never puts the address in the served HTML (scrapers harvest plain text and
 * `mailto:` links). The server render shows the address reversed in the markup and flips it back
 * visually with CSS, so it reads normally; after hydration it becomes a real mailto link.
 */
export function ObfuscatedEmail({
  user,
  domain,
  className,
  children,
}: {
  user: string;
  domain: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (ready) {
    const address = `${user}@${domain}`;
    return (
      <a href={`mailto:${address}`} className={className}>
        {address}
        {children}
      </a>
    );
  }

  const reversed = Array.from(`${user}@${domain}`).reverse().join("");
  return (
    <a href="/contact" className={className}>
      <span style={{ unicodeBidi: "bidi-override", direction: "rtl" }}>{reversed}</span>
      {children}
    </a>
  );
}
