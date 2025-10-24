// src/hooks/useAnimatedHeader.ts (New hook for easy header animation management)
import { useMemo } from "react";

// Animation preset types
export type HeaderAnimationPreset =
  | "complete-on-visible"
  | "scroll-controlled"
  | "instant-complete"
  | "delayed-complete"
  | "fast-reveal";

interface AnimatedHeaderConfig {
  completeOnVisible: boolean;
  visibilityThreshold: number;
  scrollStart: string;
  scrollEnd: string;
  animationDuration: number;
  stagger: number;
  ease: string;
}

export const useAnimatedHeader = (
  preset: HeaderAnimationPreset = "complete-on-visible"
) => {
  const config = useMemo((): AnimatedHeaderConfig => {
    switch (preset) {
      case "complete-on-visible":
        // Animation completes when text is 80% visible (default behavior)
        return {
          completeOnVisible: true,
          visibilityThreshold: 0.8,
          scrollStart: "top bottom-=50px",
          scrollEnd: "bottom top+=50px",
          animationDuration: 0.8,
          stagger: 0.02,
          ease: "power2.out",
        };

      case "scroll-controlled":
        // Traditional scroll-scrubbed animation
        return {
          completeOnVisible: false,
          visibilityThreshold: 0.5,
          scrollStart: "top bottom-=100px",
          scrollEnd: "bottom top+=100px",
          animationDuration: 1.0,
          stagger: 0.03,
          ease: "none", // Linear for scrub animations
        };

      case "instant-complete":
        // Animation completes as soon as any part is visible
        return {
          completeOnVisible: true,
          visibilityThreshold: 0.1,
          scrollStart: "top bottom",
          scrollEnd: "bottom top",
          animationDuration: 0.6,
          stagger: 0.01,
          ease: "power3.out",
        };

      case "delayed-complete":
        // Animation completes when element is almost fully visible
        return {
          completeOnVisible: true,
          visibilityThreshold: 0.95,
          scrollStart: "top bottom-=20px",
          scrollEnd: "bottom top+=20px",
          animationDuration: 1.2,
          stagger: 0.03,
          ease: "power2.out",
        };

      case "fast-reveal":
        // Quick animation that completes when 60% visible
        return {
          completeOnVisible: true,
          visibilityThreshold: 0.6,
          scrollStart: "top bottom-=30px",
          scrollEnd: "bottom top+=30px",
          animationDuration: 0.4,
          stagger: 0.005,
          ease: "power3.out",
        };

      default:
        return config;
    }
  }, [preset]);

  // Helper function to create custom config
  const createCustomConfig = (
    overrides: Partial<AnimatedHeaderConfig>
  ): AnimatedHeaderConfig => {
    return { ...config, ...overrides };
  };

  // Preset configurations for common use cases
  const presets = useMemo(
    () => ({
      // Hero section headers - should animate quickly and complete
      hero: createCustomConfig({
        completeOnVisible: true,
        visibilityThreshold: 0.3,
        animationDuration: 0.8,
        ease: "back.out(1.2)",
      }),

      // Section headers - moderate animation
      section: createCustomConfig({
        completeOnVisible: true,
        visibilityThreshold: 0.7,
        animationDuration: 0.6,
        stagger: 0.015,
      }),

      // Feature highlights - dramatic entrance
      feature: createCustomConfig({
        completeOnVisible: true,
        visibilityThreshold: 0.5,
        animationDuration: 1.0,
        stagger: 0.04,
        ease: "elastic.out(1, 0.8)",
      }),

      // Footer or end sections - subtle animation
      footer: createCustomConfig({
        completeOnVisible: true,
        visibilityThreshold: 0.9,
        animationDuration: 0.5,
        stagger: 0.01,
        ease: "power1.out",
      }),

      // Parallax headers - controlled by scroll
      parallax: createCustomConfig({
        completeOnVisible: false,
        scrollStart: "top bottom",
        scrollEnd: "bottom top",
        animationDuration: 1.0,
        ease: "none",
      }),
    }),
    [config]
  );

  return {
    config,
    presets,
    createCustomConfig,
  };
};
