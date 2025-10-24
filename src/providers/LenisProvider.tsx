// src/providers/LenisProvider.tsx (Ultra Optimized)
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenisContext must be used within LenisProvider");
  }
  return context;
};

interface LenisProviderProps {
  children: React.ReactNode;
  options?: any;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({
  children,
  options = {},
}) => {
  const lenisRef = useRef<Lenis | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: any) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, options);
      }
    },
    []
  );

  useEffect(() => {
    // Prevent multiple initializations
    if (lenisRef.current) return;

    // Optimized Lenis configuration for ultra smooth scrolling
    const lenis = new Lenis({
      // Core smooth scrolling settings
      duration: 1.5, // Slightly longer for smoother feel
      easing: (t) => {
        // Custom easing function for ultra smooth scrolling
        return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      smooth: true,
      smoothTouch: false, // Keep disabled for mobile performance

      // Fine-tuned multipliers for smooth experience
      touchMultiplier: 1.8,
      wheelMultiplier: 1.2, // Slightly increased for better responsiveness

      // Enhanced wheel normalization
      normalizeWheel: true,
      infinite: false,
      orientation: "vertical",
      gestureOrientation: "vertical",

      // Advanced performance settings
      syncTouch: true,
      syncTouchLerp: 0.075, // Lower value for smoother interpolation
      touchInertiaMultiplier: 25, // Reduced for more controlled inertia

      // Custom options for ultra smooth scrolling
      lerp: 0.05, // Lower lerp value for smoother interpolation
      wrapper: document.body,
      content: document.documentElement,

      ...options,
    });

    lenisRef.current = lenis;

    // Ultra-optimized RAF loop with frame rate control
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const raf = (time: number) => {
      if (time - lastTime >= frameInterval) {
        lenis.raf(time);
        lastTime = time;
      }
      rafIdRef.current = requestAnimationFrame(raf);
    };

    // Start RAF loop
    rafIdRef.current = requestAnimationFrame(raf);

    // Enhanced GSAP integration with smoother updates
    const setupGSAPIntegration = () => {
      let scrollTimeout: number;

      // Throttled scroll update for better performance
      const throttledScrollUpdate = (() => {
        let ticking = false;
        return () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              ScrollTrigger.update();
              ticking = false;
            });
            ticking = true;
          }
        };
      })();

      // Enhanced scroll listener
      lenis.on("scroll", () => {
        clearTimeout(scrollTimeout);

        // Update ScrollTrigger smoothly
        throttledScrollUpdate();

        // Reset scrolling state after scroll ends
        scrollTimeout = window.setTimeout(() => {}, 150);
      });

      // Optimized ScrollTrigger configuration
      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
        ignoreMobileResize: true,
        limitCallbacks: true, // Prevent excessive callback firing
      });

      // Enhanced scroller proxy for smoother integration
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value?: number) {
          if (arguments.length && value !== undefined) {
            lenis.scrollTo(value, { immediate: true, duration: 0 });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: "transform",
        fixedMarkers: true, // Better marker positioning
      });

      // Optimized batch animations
      ScrollTrigger.batch(".animate-on-scroll", {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.08,
            force3D: true,
          });
        },
        start: "top bottom-=100px",
        once: true,
      });

      // Initial refresh and ready state
      ScrollTrigger.refresh();
      setIsReady(true);
    };

    // Initialize after DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupGSAPIntegration, {
        once: true,
      });
    } else {
      setTimeout(setupGSAPIntegration, 100);
    }

    // Enhanced resize handler with debounce
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (lenisRef.current) {
          ScrollTrigger.refresh();
        }
      }, 200);
    };

    // Add resize listener with passive option
    window.addEventListener("resize", handleResize, {
      passive: true,
      capture: false,
    });

    // Cleanup function
    cleanupRef.current = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);

      if (lenis) {
        lenis.destroy();
      }

      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.clearScrollMemory();

      lenisRef.current = null;
    };

    return cleanupRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Handle page visibility changes for better performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (lenisRef.current) {
        if (document.hidden) {
          lenisRef.current.stop();
        } else {
          lenisRef.current.start();
          ScrollTrigger.refresh();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <LenisContext.Provider
      value={{
        lenis: lenisRef.current,
        isReady,
        scrollTo,
      }}
    >
      {children}
    </LenisContext.Provider>
  );
};
