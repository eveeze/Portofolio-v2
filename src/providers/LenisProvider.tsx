// src/providers/LenisProvider.tsx (Lightweight + Smooth + GSAP-friendly)
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LenisContextType {
  lenis: Lenis | null;
  isReady: boolean;
  scrollTo: (target: string | number | HTMLElement, options?: any) => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  isReady: false,
  scrollTo: () => {},
});

export const useLenisContext = () => {
  const ctx = useContext(LenisContext);
  if (!ctx)
    throw new Error('useLenisContext must be used within LenisProvider');
  return ctx;
};

interface LenisProviderProps {
  children: React.ReactNode;
  options?: any; // allow override safely
}

export const LenisProvider: React.FC<LenisProviderProps> = ({
  children,
  options = {},
}) => {
  const lenisRef = useRef<Lenis | null>(null);
  const [isReady, setIsReady] = useState(false);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, opts?: any) => {
      lenisRef.current?.scrollTo(target, opts);
    },
    [],
  );

  useEffect(() => {
    if (lenisRef.current) return;

    // Keep it simple: fewer knobs => fewer edge-cases + lighter runtime.
    // NOTE: remove "lerp" because it's not in your LenisOptions typings.
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      smooth: true,
      normalizeWheel: true,

      // Mobile performance: keep smoothTouch off unless you REALLY need it
      smoothTouch: false,
      syncTouch: true,

      wheelMultiplier: 1.1,
      touchMultiplier: 1.6,

      // allow user overrides (last wins)
      ...options,
    } as any);

    lenisRef.current = lenis;

    // ---- RAF via GSAP ticker (lighter + stable with GSAP timelines) ----
    // GSAP ticker time is in seconds; Lenis expects milliseconds.
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);

    // ---- ScrollTrigger integration ----
    // 1) Update ScrollTrigger when Lenis scrolls
    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', onLenisScroll);

    // 2) Make ScrollTrigger use Lenis virtual scroll position
    // Use <html> as scroller to avoid body transform/pinType issues.
    const scrollerEl = document.documentElement;

    ScrollTrigger.scrollerProxy(scrollerEl, {
      scrollTop(value?: number) {
        if (typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true, duration: 0 });
        }
        // @ts-ignore (Lenis has .scroll)
        return (lenis as any).scroll ?? window.scrollY ?? 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // If you ever set transforms on body/html, you can adjust this,
      // but default "fixed" is safest for most setups.
      pinType: 'fixed',
    });

    // 3) Keep Lenis in sync when ScrollTrigger refreshes (layout changes)
    const onSTRefresh = () => {
      // update Lenis internal measurements if available
      // @ts-ignore
      (lenis as any).resize?.();
    };
    ScrollTrigger.addEventListener('refresh', onSTRefresh);

    // 4) Configure ST to reduce overhead
    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true,
    });

    // Initial refresh
    ScrollTrigger.refresh();
    setIsReady(true);

    // ---- Resize handling (debounced, minimal work) ----
    let resizeId = 0;
    const onResize = () => {
      window.clearTimeout(resizeId);
      resizeId = window.setTimeout(() => {
        // @ts-ignore
        (lenis as any).resize?.();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // ---- Visibility (pause work when tab hidden) ----
    const onVis = () => {
      if (document.hidden) lenis.stop();
      else {
        lenis.start();
        // @ts-ignore
        (lenis as any).resize?.();
        ScrollTrigger.refresh();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // Cleanup: only detach what THIS provider attached (no global kill)
    return () => {
      setIsReady(false);

      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);

      ScrollTrigger.removeEventListener('refresh', onSTRefresh);
      // IMPORTANT: clear proxy we added (by setting to null-ish)
      // ScrollTrigger doesn't expose "removeProxy", but re-proxying is okay.
      // On teardown, safest is to just refresh after destroy.

      lenis.off('scroll', onLenisScroll);

      gsap.ticker.remove(onTick);

      lenis.destroy();
      lenisRef.current = null;

      ScrollTrigger.refresh();
    };
  }, [options]);

  // memo value to avoid re-renders
  const ctxValue = useMemo(
    () => ({
      lenis: lenisRef.current,
      isReady,
      scrollTo,
    }),
    [isReady, scrollTo],
  );

  return (
    <LenisContext.Provider value={ctxValue}>{children}</LenisContext.Provider>
  );
};
