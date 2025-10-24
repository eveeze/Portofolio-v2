// src/hooks/useScrollTrigger.ts
import { useEffect, useRef, useCallback } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisContext } from "../providers/LenisProvider";

interface ScrollTriggerOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onUpdate?: (progress: number) => void;
  toggleActions?: string;
}

export const useScrollTrigger = (
  animation: gsap.core.Timeline | (() => gsap.core.Timeline),
  options: ScrollTriggerOptions = {}
) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const { isReady } = useLenisContext();

  const cleanup = useCallback(() => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    cleanup();

    const tl = typeof animation === "function" ? animation() : animation;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: options.trigger || document.body,
      start: options.start || "top bottom-=100px",
      end: options.end || "bottom top+=100px",
      scrub: options.scrub ?? 1,
      pin: options.pin,
      markers: options.markers,
      animation: tl,
      toggleActions: options.toggleActions || "play none none reverse",
      invalidateOnRefresh: true,
      fastScrollEnd: 2000,
      preventOverlaps: true,
      onEnter: options.onEnter,
      onLeave: options.onLeave,
      onUpdate: (self) => {
        if (options.onUpdate) {
          options.onUpdate(self.progress);
        }
      },
    });

    return cleanup;
  }, [isReady, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return scrollTriggerRef.current;
};
