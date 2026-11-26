"use client";

import Image from "next/image";
import { useState } from "react";

const VIMEO_ID = "1099868590";
const PLAYER_SRC = `https://player.vimeo.com/video/${VIMEO_ID}?title=0&byline=0&portrait=0&autopause=0&player_id=0&app_id=58479&autoplay=1`;

/**
 * About — showreel (Figma "Showreel thumbnail" 5755:17560, 1151×720).
 * Shows the Figma thumbnail (glass X over the SHOWREEL wordmark) with its round play button until
 * the visitor presses play, then swaps in the Vimeo player. Nothing is loaded from Vimeo before
 * that click, which keeps the page fast and sets no third-party cookies for visitors who never watch.
 */
export function Showreel() {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="group/reel relative aspect-[1151/720] w-full overflow-hidden bg-black lg:self-center">
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
            src="/images/about/showreel-poster.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/reel:scale-[1.03] motion-reduce:transition-none"
          />
          {/* Play button — 5755:17565: 111.3 px circle, centred 30.5 px below the middle */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[54.24%] flex aspect-square w-[max(56px,9.67%)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(23,23,23,0.46)] shadow-[inset_-16px_-28px_46px_-34px_#fff] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/reel:scale-110 motion-reduce:transition-none"
          >
            <Image src="/images/icons/play-solid.svg" alt="" width={32} height={32} className="w-[29%]" />
          </span>
        </button>
      )}
    </figure>
  );
}
