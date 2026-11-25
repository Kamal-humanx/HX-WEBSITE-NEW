/* eslint-disable @next/next/no-img-element -- small static SVGs; next/image adds nothing here */

/**
 * Contact hero artwork (Figma group 5376:7832, 665.3 × 607.6) with a slow motion loop.
 *
 * Built from the three Figma layers rather than one flat picture: the amber sphere, the lilac
 * sphere, and the frosted X on top. The X never moves. Behind it the two spheres take turns —
 * one drifts while its colour gradient swings round inside the circle, comes back to rest, and
 * only then does the other one go. Positions are percentages of the group, so it scales with the
 * layout. Pure CSS (see .blob-* in globals.css); still for visitors who prefer reduced motion.
 */
export function ContactBlob({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative aspect-[665.3/607.636] ${className}`}>
      <img src="/images/contact/sphere-amber.svg" alt="" className="blob-sphere blob-amber absolute left-[9.933%] top-[35.861%] h-[53.863%] w-[48.647%]" />
      <img src="/images/contact/sphere-lilac.svg" alt="" className="blob-sphere blob-lilac absolute left-[58.077%] top-0 h-[46.501%] w-[41.923%]" />
      <img src="/images/contact/x-glass.svg" alt="" className="absolute inset-0 size-full" />
    </div>
  );
}
