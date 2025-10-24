// src/global.d.ts
import Lenis from "@studio-freight/lenis";

declare global {
  interface Window {
    lenis: Lenis | undefined;
  }
}
