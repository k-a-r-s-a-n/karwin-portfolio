import type Lenis from "lenis";

/**
 * Shared handle to the app-wide Lenis instance. The smooth-scroll provider
 * registers it on mount; overlays (the project modal) use it to pause native
 * scrolling while they are open — `overflow: hidden` alone doesn't stop Lenis.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
