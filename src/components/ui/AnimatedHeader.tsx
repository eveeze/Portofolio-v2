// src/components/ui/AnimatedHeader.tsx (Minimal Fix - Keep Original Logic)
import { useEffect, useMemo, useRef, RefObject, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisContext } from "../../providers/LenisProvider";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextHeaderProps {
  text: string;
  location: "start" | "end";
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  fontSize?: string;
  fontFamily?: string;
  delay?: number;
}

const AnimatedTextHeader: React.FC<AnimatedTextHeaderProps> = ({
  text,
  location,
  containerClassName = "",
  textClassName = "",
  animationDuration = 0.8,
  ease = "power2.out",
  scrollStart = "top bottom-=100px",
  scrollEnd = "bottom top+=100px",
  stagger = 0.02,
  fontFamily = "font-oggs",
  delay = 0,
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const { isReady } = useLenisContext();

  const justifyClass = location === "start" ? "justify-start" : "justify-end";

  // Keep original text splitting logic but with namespace to prevent conflicts
  const splitText = useMemo(() => {
    const words = text.split(" ");
    return words.map((word, wordIndex) => (
      <span
        key={`header-word-${wordIndex}`}
        className="header-word inline-block mr-4"
        style={{
          overflow: "hidden",
          display: "inline-block",
        }}
      >
        {word.split("").map((char, charIndex) => (
          <span
            className="header-char inline-block"
            key={`header-${wordIndex}-${charIndex}`}
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    ));
  }, [text]);

  const cleanup = useCallback(() => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
  }, []);

  const createAnimation = useCallback(() => {
    const el = containerRef.current;
    if (!el || !isReady) return;

    cleanup();

    // Use namespaced selector to prevent conflicts with Hero
    const charElements = el.querySelectorAll(".header-char");
    if (charElements.length === 0) return;

    // Keep original initial state setup
    gsap.set(charElements, {
      willChange: "transform",
      opacity: 0,
      y: "100%",
      transformOrigin: "center bottom",
      force3D: true,
    });

    // Keep original timeline structure
    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: animationDuration,
        ease: ease,
      },
    });

    // Keep original animation logic
    tl.to(charElements, {
      opacity: 1,
      y: "0%",
      stagger: {
        amount: Math.min(stagger * charElements.length, 0.8),
        ease: "power1.out",
      },
      onComplete: () => {
        gsap.set(charElements, { willChange: "auto" });
      },
    });

    timelineRef.current = tl;

    // Keep original ScrollTrigger setup but with scroller fix
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: el,
      start: scrollStart,
      end: scrollEnd,
      scrub: 1,
      animation: tl,
      invalidateOnRefresh: true,
      refreshPriority: 0,
      fastScrollEnd: 2000,
      preventOverlaps: "previous",
      scroller: document.body, // Fix: specify scroller for Lenis
      onUpdate: (self) => {
        if (self.isActive) {
          const progress = Math.max(0, Math.min(1, self.progress));
          tl.progress(progress);
        }
      },
      onToggle: (self) => {
        if (self.isActive) {
          gsap.set(charElements, { willChange: "transform" });
        } else if (!self.isActive && self.progress === 0) {
          gsap.set(charElements, { willChange: "auto" });
        }
      },
    });
  }, [
    text,
    animationDuration,
    ease,
    scrollStart,
    scrollEnd,
    stagger,
    isReady,
    cleanup,
  ]);

  // Keep original effect setup but add small delay
  useEffect(() => {
    if (!isReady) return;

    const timeoutId = setTimeout(createAnimation, delay + 50);
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [createAnimation, delay, isReady, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <h1
      ref={containerRef}
      className={`px-8 font-normal flex ${justifyClass} text-[245px] ${fontFamily} tracking-tight text-whiteText leading-[0.78] -mb-6 ${containerClassName}`}
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "auto",
      }}
    >
      <span
        className={`${textClassName} inline-block`}
        style={{ overflow: "hidden" }}
      >
        {splitText}
      </span>
    </h1>
  );
};

export default AnimatedTextHeader;
