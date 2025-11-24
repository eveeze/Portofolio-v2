// src/components/ui/AnimatedHeader.tsx (Optimized - Smooth Scroll + Awwwards Responsive)
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

  const splitText = useMemo(() => {
    const words = text.split(" ");
    return words.map((word, wordIndex) => (
      <span
        key={`header-word-${wordIndex}`}
        className="header-word inline-block mr-2 sm:mr-3 md:mr-4"
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

    const charElements = el.querySelectorAll(".header-char");
    if (charElements.length === 0) return;

    gsap.set(charElements, {
      willChange: "transform",
      opacity: 0,
      y: "100%",
      transformOrigin: "center bottom",
      force3D: true,
    });

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: animationDuration,
        ease: ease,
      },
    });

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

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: el,
      start: scrollStart,
      end: scrollEnd,
      scrub: 0.5,
      animation: tl,
      invalidateOnRefresh: true,
      refreshPriority: 0,
      fastScrollEnd: true,
      anticipatePin: 1,
      scroller: document.body,
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

  useEffect(() => {
    if (!isReady) return;

    const timeoutId = setTimeout(() => {
      createAnimation();
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
      className={`px-4 sm:px-6 md:px-8 font-normal flex ${justifyClass} text-[clamp(2.5rem,12vw,15.3125rem)] ${fontFamily} tracking-tight sm:tracking-tight md:tracking-tight text-whiteText leading-[0.85] sm:leading-[0.82] md:leading-[0.8] lg:leading-[0.78] -mb-3 sm:-mb-4 md:-mb-5 lg:-mb-6 ${containerClassName}`}
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
