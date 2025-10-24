// src/utils/smoothScrollUtils.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Enhanced scroll optimization utilities
export class SmoothScrollOptimizer {
  private static instance: SmoothScrollOptimizer;
  private observers: IntersectionObserver[] = [];
  private rafId: number | null = null;
  private scrollElements: Set<HTMLElement> = new Set();

  static getInstance(): SmoothScrollOptimizer {
    if (!SmoothScrollOptimizer.instance) {
      SmoothScrollOptimizer.instance = new SmoothScrollOptimizer();
    }
    return SmoothScrollOptimizer.instance;
  }

  // Initialize performance optimizations
  public initializeOptimizations(): void {
    this.setupViewportObserver();
    this.optimizeScrollbarRendering();
    this.setupScrollCache();
    this.preventScrollJank();
  }

  // Setup viewport observer for efficient element tracking
  private setupViewportObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            // Element is visible - enable animations
            element.style.willChange = "transform, opacity";
            this.scrollElements.add(element);
          } else {
            // Element is not visible - disable animations
            element.style.willChange = "auto";
            this.scrollElements.delete(element);
          }
        });
      },
      {
        root: null,
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    // Observe all animated elements
    document
      .querySelectorAll(".animate-on-scroll, [data-animate]")
      .forEach((el) => {
        observer.observe(el);
      });

    this.observers.push(observer);
  }

  // Optimize scrollbar rendering
  private optimizeScrollbarRendering(): void {
    const style = document.createElement("style");
    style.textContent = `
      /* Force scrollbar layer promotion for smooth rendering */
      ::-webkit-scrollbar {
        transform: translateZ(0);
        will-change: opacity;
      }
      
      ::-webkit-scrollbar-thumb {
        transform: translateZ(0);
        will-change: background-color;
      }
      
      /* Optimize scroll container */
      html, body {
        contain: layout style;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(style);
  }

  // Setup scroll position caching for better performance
  private setupScrollCache(): void {
    let scrollTimeout: number;

    const updateScrollState = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        // Clean up will-change properties after scrolling stops
        this.scrollElements.forEach((element) => {
          element.style.willChange = "auto";
        });
      }, 150);
    };

    // Throttled scroll listener
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });
  }

  // Prevent scroll jank with various optimizations
  private preventScrollJank(): void {
    // Optimize paint and layout operations
    const optimizeRender = () => {
      // Batch DOM updates
      document.documentElement.style.contain = "layout style paint";

      // Optimize compositing
      document.body.style.transform = "translateZ(0)";
      document.body.style.backfaceVisibility = "hidden";

      // Setup efficient repaints
      this.setupEfficientRepaints();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", optimizeRender);
    } else {
      optimizeRender();
    }
  }

  // Setup efficient repaints for smoother scrolling
  private setupEfficientRepaints(): void {
    const observer = new MutationObserver((mutations) => {
      let shouldOptimize = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          shouldOptimize = true;
        }
      });

      if (shouldOptimize) {
        this.optimizeNewElements();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    this.observers.push(observer as any);
  }

  // Optimize newly added elements
  private optimizeNewElements(): void {
    // Find and optimize new animated elements
    const newElements = document.querySelectorAll(
      ".animate-on-scroll:not([data-optimized])"
    );

    newElements.forEach((element) => {
      const el = element as HTMLElement;

      // Mark as optimized
      el.setAttribute("data-optimized", "true");

      // Apply performance optimizations
      el.style.transform = "translateZ(0)";
      el.style.backfaceVisibility = "hidden";
      el.style.willChange = "auto"; // Start with auto, change when needed

      // Add to intersection observer
      this.observers[0]?.observe?.(el);
    });
  }

  // Enhanced GSAP ScrollTrigger optimization
  public optimizeScrollTrigger(): void {
    // Configure ScrollTrigger for maximum performance
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });

    // Optimize existing ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => {
      // Add performance settings to existing triggers
      if (trigger.vars) {
        trigger.vars.fastScrollEnd = 2000;
        trigger.vars.preventOverlaps = true;
        trigger.vars.refreshPriority = 0;
      }
    });
  }

  // Cleanup method
  public cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.scrollElements.clear();

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

// Enhanced smooth scroll hook
export const useSmoothScrollOptimization = () => {
  const optimizer = SmoothScrollOptimizer.getInstance();

  const initializeOptimizations = () => {
    optimizer.initializeOptimizations();
    optimizer.optimizeScrollTrigger();
  };

  const cleanup = () => {
    optimizer.cleanup();
  };

  return {
    initializeOptimizations,
    cleanup,
  };
};

// Utility function to create ultra-smooth scroll animations
export const createUltraSmoothAnimation = (
  elements: string | NodeListOf<Element> | Element[],
  config: {
    trigger?: string | Element;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    animation?: gsap.core.Animation | (() => gsap.core.Animation);
  }
) => {
  const targets =
    typeof elements === "string"
      ? document.querySelectorAll(elements)
      : Array.from(elements);

  if (!targets.length) return null;

  targets.forEach((target) => {
    const element = target as HTMLElement;
    element.style.transform = "translateZ(0)";
    element.style.backfaceVisibility = "hidden";
    // Set will-change to auto initially
    element.style.willChange = "auto";
  });

  const scrollTrigger = ScrollTrigger.create({
    trigger: config.trigger || targets[0],
    start: config.start || "top bottom-=100px",
    end: config.end || "bottom top+=100px",
    scrub: config.scrub ?? 1,
    animation: config.animation as any,

    // Performance optimizations
    fastScrollEnd: 2000,
    preventOverlaps: true,
    refreshPriority: 0,
    anticipatePin: 1,

    // ✅ FIXED: Use a single onToggle to manage state changes
    onToggle: (self) => {
      // Apply 'will-change' only when the animation is active
      targets.forEach((target) => {
        (target as HTMLElement).style.willChange = self.isActive
          ? "transform, opacity"
          : "auto";
      });
    },
  });

  return scrollTrigger;
};

// Export default optimizer instance
export default SmoothScrollOptimizer;
