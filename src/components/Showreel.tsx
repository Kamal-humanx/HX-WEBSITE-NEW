"use client";

import Image from "next/image";
import { useState } from "react";

const VIMEO_ID = "1099868590";
const PLAYER_SRC = `https://player.vimeo.com/video/${VIMEO_ID}?title=0&byline=0&portrait=0&autopause=0&player_id=0&app_id=58479&autoplay=1`;

/**
 * About — showreel (Figma 5724:39320, 1151×718).
 * Shows the poster until the visitor presses play, then swaps in the Vimeo player. Nothing is
 * loaded from Vimeo before that click, which keeps the page fast and sets no third-party cookies
 * for visitors who never watch.
 */
export function Showreel() {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="group/reel relative aspect-[1151/718] w-full overflow-hidden bg-black lg:self-start">
      {playing ? (
        <iframe
          src={PLAYER_SRC}
          title="HumanX Showreel"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play the HumanX showreel"
          className="absolute inset-0 size-full cursor-pointer focus-visible:outline-offset-[-6px]"
        >
          <Image
            src="/images/about/showreel.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-contain transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/reel:scale-[1.035] motion-reduce:transition-none"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover/reel:bg-black/15" />
        </button>
      )}
    </figure>
  );
}
