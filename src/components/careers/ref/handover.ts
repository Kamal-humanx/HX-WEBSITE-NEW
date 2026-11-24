/* The pan from open roles to life here: when it runs, both sections hold together and the visitor's
   scroll moves the studio's panel across from the right. Both sections ask this one question so they
   always agree. It needs room (a desktop-sized window) and motion; otherwise they simply follow on. */

import { motionOn } from './scroll'
export const PAN = 0.95 // the pan's length, in screen heights of scroll

export const handover = () =>
  motionOn() &&
  matchMedia('(min-width: 761px) and (min-height: 760px)').matches &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches
