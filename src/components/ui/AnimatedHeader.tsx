// src/components/ui/AnimatedHeader.tsx (Optimized - Smooth Scroll)
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

  // Optimized: Memoize dengan React.memo style untuk prevent re-render
  const splitText = useMemo(() => {
    const words = text.split(" ");
    return words.map((word, wordIndex) => (
      <span
        key={`header-word-${wordIndex}`}
        className="header-word inline-block mr-4"
        style={{
          overflow: "hidden",
          display: "inline-block",
          transform: "translateZ(0)",
        }}
      >
        {word.split("").map((char, charIndex) => (
          <span
            className="header-char inline-block"
            key={`header-${wordIndex}-${charIndex}`}
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    ));
  }, [text]);

  // Optimized: Memoize cleanup function
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

  // Optimized animation with smoother scroll performance
  const createAnimation = useCallback(() => {
    const el = containerRef.current;
    if (!el || !isReady) return;

    cleanup();

    const charElements = el.querySelectorAll(".header-char");
    if (charElements.length === 0) return;

    // EXACT same initial state
    gsap.set(charElements, {
      willChange: "transform",
      opacity: 0,
      y: "100%",
      transformOrigin: "center bottom",
      force3D: true,
    });

    // EXACT same timeline
    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: animationDuration,
        ease: ease,
      },
    });

    // EXACT same animation
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

    // OPTIMIZED ScrollTrigger - smoother scrub & better performance
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: el,
      start: scrollStart,
      end: scrollEnd,
      scrub: 0.5, // Lebih smooth dari 1
      animation: tl,
      invalidateOnRefresh: true,
      refreshPriority: 0,
      fastScrollEnd: true,
      anticipatePin: 1,
      scroller: document.body,
      // Removed manual onUpdate - let GSAP handle it for smoother performance
    });
  }, [
    animationDuration,
    ease,
    scrollStart,
    scrollEnd,
    stagger,
    isReady,
    cleanup,
  ]);

  // Optimized: Combine effects with refresh on mount
  useEffect(() => {
    if (!isReady) return;

    const timeoutId = setTimeout(() => {
      createAnimation();
      // Refresh ScrollTrigger after animation setup for smooth start
      ScrollTrigger.refresh();
    }, delay + 50);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [createAnimation, delay, isReady, cleanup]);

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
