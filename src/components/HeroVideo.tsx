"use client";

import { useEffect, useRef } from "react";

/**
 * Homepage hero: a silent video on a loop, playing by itself with no controls (Pexels 7128597,
 * "Girls looking at mobile phone screen"). It fills the hero's existing box (object-cover), keeping
 * the girls' faces in view on wide screens; phones get a squarer crop of the same clip so both stay
 * in frame. Visitors who ask for reduced motion see its first frame, still.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.removeAttribute("autoplay");
      return;
    }
    /* some browsers hold back autoplay until the element is ready; nudge it */
    v.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 size-full object-cover object-[50%_30%] md:object-[50%_32%]"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/videos/home-hero-poster.webp"
      disablePictureInPicture
      disableRemotePlayback
      aria-label="Two girls laughing together as they look at their phones"
    >
      {/* phones: a squarer crop, smaller file */}
      <source src="/videos/home-hero-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
      <source src="/videos/home-hero.mp4" type="video/mp4" />
    </video>
  );
}
