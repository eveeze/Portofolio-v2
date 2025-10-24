// src/types/lenis.d.ts
declare module "@studio-freight/lenis" {
  export interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    infinite?: boolean;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
    normalizeWheel?: boolean;
    wheelMultiplier?: number;
  }

  export default class Lenis {
    scroll: number;
    velocity: number;
    direction: number;
    progress: number;
    isScrolling: boolean;

    constructor(options?: LenisOptions);

    raf(time: number): void;
    scrollTo(target: string | number | HTMLElement, options?: any): void;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    stop(): void;
    start(): void;
    destroy(): void;
  }
}
