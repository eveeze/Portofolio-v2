// src/hooks/useLenisControl.ts (Optimized)
import { useCallback } from "react";
import { useLenisContext } from "../providers/LenisProvider";

export const useLenisControl = () => {
  const { lenis, scrollTo } = useLenisContext();

  const scrollToTop = useCallback(
    (options = {}) => {
      scrollTo(0, { duration: 1.2, ...options });
    },
    [scrollTo]
  );

  const scrollToElement = useCallback(
    (selector: string, options = {}) => {
      const element = document.querySelector(selector);
      if (element) {
        scrollTo(element as HTMLElement, {
          duration: 1.2,
          offset: -100, // Default offset for header
          ...options,
        });
      }
    },
    [scrollTo]
  );

  const scrollToWithOffset = useCallback(
    (target: string | number | HTMLElement, offset = 0, options = {}) => {
      if (typeof target === "string") {
        const element = document.querySelector(target);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset + rect.top - offset;
          scrollTo(scrollTop, { duration: 1.2, ...options });
        }
      } else if (typeof target === "number") {
        scrollTo(target - offset, { duration: 1.2, ...options });
      } else if (target instanceof HTMLElement) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - offset;
        scrollTo(scrollTop, { duration: 1.2, ...options });
      }
    },
    [scrollTo]
  );

  const stop = useCallback(() => {
    lenis?.stop();
  }, [lenis]);

  const start = useCallback(() => {
    lenis?.start();
  }, [lenis]);

  const getCurrentScroll = useCallback(() => {
    return lenis?.scroll || 0;
  }, [lenis]);

  const getVelocity = useCallback(() => {
    return (lenis as any)?.velocity || 0;
  }, [lenis]);

  const getDirection = useCallback(() => {
    return (lenis as any)?.direction || 0;
  }, [lenis]);

  const isScrolling = useCallback(() => {
    return (lenis as any)?.isScrolling || false;
  }, [lenis]);

  return {
    lenis,
    scrollTo,
    scrollToTop,
    scrollToElement,
    scrollToWithOffset,
    stop,
    start,
    getCurrentScroll,
    getVelocity,
    getDirection,
    isScrolling,
  };
};
