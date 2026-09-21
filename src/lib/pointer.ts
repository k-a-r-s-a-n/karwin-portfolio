/**
 * Shared live pointer state, written by the ink-ribbon cursor every frame and
 * read by interactive canvases (SplashField).
 *
 * Crucially, the position published here is the *rendered ribbon head* — not
 * the raw pointer — so physics reacts exactly where the user sees the cursor.
 * On touch / reduced-motion devices the cursor never activates and consumers
 * fall back to their own event listeners.
 */
export interface PointerState {
  /** Ribbon head position, viewport coordinates. */
  x: number;
  y: number;
  /** Ribbon head velocity, px/s. */
  vx: number;
  vy: number;
  /** True while the primary button is held. */
  down: boolean;
  /** True when the ribbon cursor is active (fine pointer, motion allowed). */
  active: boolean;
}

export const pointerState: PointerState = {
  x: -9999,
  y: -9999,
  vx: 0,
  vy: 0,
  down: false,
  active: false,
};
