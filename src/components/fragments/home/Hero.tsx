// src/components/fragments/home/Hero.tsx
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTechStacks } from '../../../hooks/useTechStacks';

gsap.registerPlugin(ScrollTrigger);

// ===========================
// SMALL UTILS
// ===========================
const debounce = <T extends (...args: any[]) => void>(fn: T, wait = 150) => {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
};

// ===========================
// HELPER: SPLIT TEXT INTO CHARS (di luar komponen)
// ===========================
const splitChars = (el: HTMLElement) => {
  const text = el.textContent || '';
  el.innerHTML = '';
  const chars: HTMLSpanElement[] = [];

  text.split(' ').forEach((word, wIndex, arr) => {
    const wrap = document.createElement('span');
    wrap.style.display = 'inline-block';
    wrap.style.overflow = 'hidden';

    word.split('').forEach((c) => {
      const span = document.createElement('span');
      span.textContent = c;
      span.className = 'char inline-block';
      wrap.appendChild(span);
      chars.push(span);
    });

    el.appendChild(wrap);

    if (wIndex < arr.length - 1) {
      const space = document.createElement('span');
      space.textContent = ' ';
      space.className = 'char inline-block';
      el.appendChild(space);
      chars.push(space);
    }
  });

  return chars;
};

const Hero: React.FC = () => {
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  const topHeaderRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const fullstackTitleRef = useRef<HTMLHeadingElement>(null);
  const developerTitleRef = useRef<HTMLHeadingElement>(null);
  const profileImageRef = useRef<HTMLDivElement>(null);

  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteContainerRef = useRef<HTMLDivElement>(null);

  const ribbonARef = useRef<HTMLDivElement>(null);
  const ribbonBRef = useRef<HTMLDivElement>(null);

  const { stacks, isLoading, isEmpty } = useTechStacks();

  const setTopHeaderRef =
    (index: number) => (el: HTMLHeadingElement | null) => {
      topHeaderRefs.current[index] = el;
    };

  // ===========================
  // MEMOIZED RIBBON CONTENT
  // ===========================
  const ribbonItems = useMemo(() => {
    if (isLoading || isEmpty) return null;

    return stacks.map((stack, idx) => (
      <div
        key={`${stack._id}-${idx}`}
        className="flex items-center gap-3 px-6 sm:px-8 md:px-10 lg:px-12"
      >
        {stack.imageUrl && (
          <img
            src={stack.imageUrl}
            alt={stack.name}
            className="techstack-icon h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 object-contain"
            loading="lazy"
            decoding="async"
          />
        )}
        <span className="text-sm sm:text-base md:text-lg tracking-wider uppercase font-centsbook text-whiteText/80">
          {stack.name}
        </span>
      </div>
    ));
  }, [stacks, isLoading, isEmpty]);

  // ===========================
  // INFINITE RIBBON LOOP (lighter + stable)
  // ===========================
  useLayoutEffect(() => {
    if (isEmpty || isLoading) return;

    const ribbonTweens: gsap.core.Tween[] = [];

    const createInfiniteRibbon = (
      wrapper: HTMLDivElement,
      baseSpeed: number,
      direction: 'left' | 'right' = 'left',
    ) => {
      const track = wrapper.querySelector(
        '.ribbon-track',
      ) as HTMLElement | null;
      const firstSegment = wrapper.querySelector(
        '.ribbon-segment',
      ) as HTMLElement | null;

      if (!track || !firstSegment) return;

      const segmentWidth = firstSegment.offsetWidth;
      if (!segmentWidth) return;

      const duration = segmentWidth / baseSpeed;
      const fromX = direction === 'left' ? 0 : -segmentWidth;
      const toX = direction === 'left' ? -segmentWidth : 0;

      const tween = gsap.fromTo(
        track,
        { x: fromX },
        {
          x: toX,
          duration,
          ease: 'none',
          repeat: -1,
          force3D: true,
        },
      );

      ribbonTweens.push(tween);
    };

    if (ribbonARef.current)
      createInfiniteRibbon(ribbonARef.current, 50, 'left');
    if (ribbonBRef.current)
      createInfiniteRibbon(ribbonBRef.current, 35, 'right');

    return () => {
      ribbonTweens.forEach((t) => t.kill());
    };
  }, [isEmpty, isLoading]);

  // ===========================
  // TEXT + QUOTE ANIMATIONS (mobile slow + less jitter)
  // ===========================
  useLayoutEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    // If reduced motion, skip heavy scroll stuff, but still render layout.
    if (reduced) return;

    const ctx = gsap.context(() => {
      // ---- Intro text animation (split)
      const headerChars = topHeaderRefs.current.flatMap((el) =>
        el ? splitChars(el) : [],
      );
      const fullstackChars = fullstackTitleRef.current
        ? splitChars(fullstackTitleRef.current)
        : [];
      const developerChars = developerTitleRef.current
        ? splitChars(developerTitleRef.current)
        : [];

      const tl = gsap.timeline({ delay: 0.25 });

      gsap.set(headerChars, { opacity: 0, yPercent: 120, force3D: true });
      gsap.set([...fullstackChars, ...developerChars], {
        opacity: 0,
        yPercent: 120,
        force3D: true,
      });

      if (profileImageRef.current) {
        gsap.set(profileImageRef.current, { opacity: 0, scale: 0.86 });
      }

      tl.to(headerChars, {
        opacity: 1,
        yPercent: 0,
        duration: 0.85,
        stagger: { amount: Math.min(0.02 * headerChars.length, 0.85) },
        ease: 'power2.out',
      })
        .to(
          profileImageRef.current,
          { opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out' },
          0.55,
        )
        .to(
          fullstackChars,
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.85,
            stagger: { amount: 0.45 },
          },
          0.95,
        )
        .to(
          developerChars,
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.85,
            stagger: { amount: 0.45 },
          },
          1.25,
        );

      // ---- Quote scroll animation
      let st: ScrollTrigger | null = null;
      let idleTimeout: number | undefined;

      const setupQuote = () => {
        if (
          !quoteRef.current ||
          !quoteContainerRef.current ||
          !heroWrapperRef.current
        )
          return;

        const quote = quoteRef.current;
        const container = quoteContainerRef.current;
        const wrapper = heroWrapperRef.current;

        // recompute sizes
        const textWidth = quote.scrollWidth;
        const containerWidth = container.clientWidth;
        const distance = Math.max(textWidth - containerWidth, 0);

        // nothing to animate
        if (distance <= 0) {
          gsap.set(wrapper, { minHeight: '100vh' });
          gsap.set(quote, { clearProps: 'transform' });
          if (st) st.kill();
          st = null;
          return;
        }

        // Make the scroll span longer on touch so it feels "slow" and smooth
        const viewport = window.innerHeight;
        const baseSpan = Math.max(viewport * 0.95, distance * 0.7);
        const scrollSpan = isTouch ? baseSpan * 1.9 : baseSpan * 1.25;

        // Give a tiny extra so transition to next section doesn’t "snap"
        gsap.set(wrapper, {
          minHeight: viewport + scrollSpan + viewport * 0.35,
        });

        // kill old trigger if any
        if (st) st.kill();

        // Use quickSetter for x (cheaper), quickTo for skew (smooth)
        const setX = gsap.quickSetter(quote, 'x', 'px');
        const skewTo = gsap.quickTo(quote, 'skewX', {
          duration: isTouch ? 0.45 : 0.28,
          ease: 'power3.out',
        });

        gsap.set(quote, { x: 0, skewX: 0, force3D: true });

        let prevProgress = 0;
        let smoothedDelta = 0;

        st = ScrollTrigger.create({
          trigger: wrapper,
          start: 'top top',
          end: `+=${scrollSpan}`,
          scrub: isTouch ? 1.35 : 0.75, // touch slower (more damped)
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          // IMPORTANT: if Lenis uses body as scrollerProxy, keep it consistent
          scroller: document.body,
          onUpdate: (self) => {
            const p = self.progress;

            // map progress to x
            setX(-distance * p);

            // skew based on delta (clamped + slower on touch)
            const delta = p - prevProgress;
            prevProgress = p;

            const smoothing = isTouch ? 0.18 : 0.35;
            smoothedDelta += (delta - smoothedDelta) * smoothing;

            const strength = isTouch ? 650 : 1500;
            const rawSkew = smoothedDelta * strength;
            const targetSkew = gsap.utils.clamp(-45, 45, rawSkew);

            skewTo(targetSkew);

            if (idleTimeout) clearTimeout(idleTimeout);
            idleTimeout = window.setTimeout(
              () => skewTo(0),
              isTouch ? 160 : 120,
            );
          },
        });
      };

      // initial setup after fonts/layout settle a bit
      const initTimer = window.setTimeout(() => {
        setupQuote();
        ScrollTrigger.refresh();
      }, 120);

      const onResize = debounce(() => {
        setupQuote();
        ScrollTrigger.refresh();
      }, 180);

      window.addEventListener('resize', onResize, { passive: true });

      return () => {
        window.clearTimeout(initTimer);
        window.removeEventListener('resize', onResize);
        if (idleTimeout) clearTimeout(idleTimeout);
        if (st) st.kill();
        tl.kill();
      };
    }, heroWrapperRef);

    return () => ctx.revert();
  }, []);

  // ===========================
  // RETURN JSX
  // ===========================
  return (
    <div ref={heroWrapperRef} className="relative bg-background2">
      {/* Sticky stage */}
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="flex flex-col h-full px-4 sm:px-8 lg:px-12">
          {/* Top Header */}
          <div className="flex justify-between items-start pt-16 sm:pt-20 md:pt-7 lg:pt-14">
            <h1
              ref={setTopHeaderRef(0)}
              className="text-2xl sm:text-3xl lg:text-4xl font-oggs font-bold tracking-tighter text-grayText"
            >
              A
            </h1>
            <h1
              ref={setTopHeaderRef(1)}
              className="text-2xl sm:text-3xl lg:text-4xl font-oggs font-bold tracking-tighter text-grayText"
            >
              SERIOUSLY
            </h1>
            <h1
              ref={setTopHeaderRef(2)}
              className="text-2xl sm:text-3xl lg:text-4xl font-oggs font-bold tracking-tighter text-grayText"
            >
              GOOD
            </h1>
          </div>

          {/* Main Title */}
          <div
            className="flex justify-center items-center relative z-10
            mt-3 sm:mt-4 md:-mt-1 lg:-mt-2 xl:-mt-3
            flex-wrap"
          >
            <h1
              ref={fullstackTitleRef}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-oggs font-bold text-whiteText mr-4 sm:mr-6 lg:mr-8"
            >
              FULLSTACK
            </h1>
            <h1
              ref={developerTitleRef}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-oggs font-bold text-whiteText"
            >
              DEVELOPER
            </h1>
          </div>

          {/* RIBBONS */}
          {!isEmpty && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              {/* Ribbon A */}
              <div
                ref={ribbonARef}
                className="absolute w-[180vw] h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden left-1/2 top-1/2 z-[1] border-y border-whiteText/35"
                style={{
                  transform: 'translate(-50%, -50%) rotate(-12deg)',
                  transformOrigin: 'center',
                }}
              >
                <div className="ribbon-track absolute inset-0 flex items-center whitespace-nowrap will-change-transform">
                  <div className="ribbon-segment flex items-center">
                    {ribbonItems}
                  </div>
                  <div
                    className="ribbon-segment flex items-center"
                    aria-hidden="true"
                  >
                    {ribbonItems}
                  </div>
                </div>
              </div>

              {/* Ribbon B */}
              <div
                ref={ribbonBRef}
                className="absolute w-[180vw] h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden left-1/2 top-1/2 z-[1] border-y border-whiteText/25"
                style={{
                  transform: 'translate(-50%, -50%) rotate(12deg)',
                  transformOrigin: 'center',
                }}
              >
                <div className="ribbon-track absolute inset-0 flex items-center whitespace-nowrap will-change-transform">
                  <div className="ribbon-segment flex items-center">
                    {ribbonItems}
                  </div>
                  <div
                    className="ribbon-segment flex items-center"
                    aria-hidden="true"
                  >
                    {ribbonItems}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE IMAGE */}
          <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none -translate-y-10 sm:-translate-y-8 md:translate-y-0">
            <div
              ref={profileImageRef}
              className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 overflow-hidden"
            >
              <img
                src="/images/pp.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Quotes */}
        <div
          ref={quoteContainerRef}
          className="
            absolute left-0 right-0 w-full overflow-hidden z-10
            bottom-7 sm:bottom-7 md:bottom-2 lg:bottom-3 xl:bottom-4
          "
        >
          <div
            ref={quoteRef}
            className="
              inline-block whitespace-nowrap will-change-transform
              text-[92px] sm:text-8xl md:text-8xl lg:text-9xl xl:text-[160px] 2xl:text-[192px]
              text-whiteText font-oggs uppercase tracking-tight
            "
            style={{ lineHeight: '1.08', paddingLeft: '2px' }}
          >
            ELEVATING USER EXPERIENCES THROUGH OPTIMIZED CODE.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
