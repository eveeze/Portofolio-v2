// src/utils/gsapOptimizedUtils.ts (New optimized utilities)
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Performance-optimized animation presets
export const animationPresets = {
  // Fast, lightweight fade in
  fadeIn: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
  },

  // Optimized scale animation
  scaleIn: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.2)" },
  },

  // Slide animations
  slideInLeft: {
    from: { x: -60, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
  },

  slideInRight: {
    from: { x: 60, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
  },

  // Text reveal (optimized)
  textReveal: {
    from: { y: "100%", opacity: 0 },
    to: { y: "0%", opacity: 1, duration: 0.8, ease: "power2.out" },
  },
};

// Optimized batch animations for multiple elements
export const createBatchAnimation = (
  elements: string | NodeListOf<Element>,
  preset: keyof typeof animationPresets,
  options: {
    stagger?: number;
    delay?: number;
    trigger?: string | Element;
    start?: string;
    end?: string;
  } = {}
) => {
  const {
    stagger = 0.1,
    delay = 0,
    trigger,
    start = "top bottom-=50px",
  } = options;

  const targets =
    typeof elements === "string"
      ? document.querySelectorAll(elements)
      : elements;

  if (!targets.length) return null;

  const animConfig = animationPresets[preset];

  // Set initial state
  gsap.set(targets, { ...animConfig.from, willChange: "transform" });

  const tl = gsap.timeline({
    delay,
    onComplete: () => {
      // Clean up will-change after animation
      gsap.set(targets, { willChange: "auto" });
    },
  });

  tl.to(targets, {
    ...animConfig.to,
    stagger: Math.min(stagger, 0.3), // Cap stagger for performance
  });

  // Create ScrollTrigger if trigger is provided
  if (trigger) {
    return ScrollTrigger.create({
      trigger,
      start,
      animation: tl,
      toggleActions: "play none none reverse",
      fastScrollEnd: 2000,
    });
  }

  return tl;
};

// Optimized text split and animate function
export const createTextSplitAnimation = (
  element: string | Element,
  options: {
    splitBy?: "chars" | "words" | "lines";
    stagger?: number;
    duration?: number;
    ease?: string;
    trigger?: string | Element;
    start?: string;
  } = {}
) => {
  const {
    splitBy = "chars",
    stagger = 0.02,
    duration = 0.8,
    ease = "power2.out",
    trigger,
    start = "top bottom-=100px",
  } = options;

  const el =
    typeof element === "string" ? document.querySelector(element) : element;
  if (!el) return null;

  const text = el.textContent || "";
  let splitElements: HTMLElement[] = [];

  if (splitBy === "chars") {
    // Create character spans
    const chars = text.split("");
    el.innerHTML = chars
      .map(
        (char) =>
          `<span class="char" style="display: inline-block;">${char === " " ? "&nbsp;" : char}</span>`
      )
      .join("");
    splitElements = Array.from(el.querySelectorAll(".char")) as HTMLElement[];
  } else if (splitBy === "words") {
    // Create word spans
    const words = text.split(" ");
    el.innerHTML = words
      .map(
        (word) =>
          `<span class="word" style="display: inline-block; margin-right: 0.25em;">${word}</span>`
      )
      .join("");
    splitElements = Array.from(el.querySelectorAll(".word")) as HTMLElement[];
  }

  if (!splitElements.length) return null;

  // Set initial state
  gsap.set(splitElements, {
    opacity: 0,
    y: "100%",
    willChange: "transform",
    transformOrigin: "center bottom",
  });

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(splitElements, { willChange: "auto" });
    },
  });

  tl.to(splitElements, {
    opacity: 1,
    y: "0%",
    duration,
    ease,
    stagger: Math.min(stagger * splitElements.length, 1), // Cap total stagger time
  });

  // Create ScrollTrigger if trigger is provided
  if (trigger) {
    return ScrollTrigger.create({
      trigger,
      start,
      animation: tl,
      scrub: 1,
      fastScrollEnd: 2000,
    });
  }

  return tl;
};

// Performance monitoring and optimization
export const optimizeGSAP = () => {
  // Set global GSAP defaults for better performance
  gsap.defaults({
    ease: "power2.out",
    duration: 0.8,
    force3D: true,
    lazy: true,
  });

  // Configure ScrollTrigger for optimal performance
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });

  // Batch ScrollTrigger updates for better performance
  ScrollTrigger.batch(".animate-on-scroll", {
    onEnter: (elements) => {
      gsap.from(elements, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
      });
    },
    once: true, // Only animate once
    start: "top bottom-=50px",
  });
};

// Cleanup utility for performance
export const cleanupAnimations = () => {
  // Kill all ScrollTriggers
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

  // Clear ScrollTrigger cache
  ScrollTrigger.clearScrollMemory();

  // Kill all GSAP tweens
  gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => {
    tween.kill();
  });
};
