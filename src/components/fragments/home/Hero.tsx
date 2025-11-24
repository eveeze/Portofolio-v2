import React, { useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTechStacks } from "../../../hooks/useTechStacks";

gsap.registerPlugin(ScrollTrigger);

// ===========================
// HELPER: SPLIT TEXT INTO CHARS (di luar komponen)
// ===========================
const splitChars = (el: HTMLElement) => {
  const text = el.textContent || "";
  el.innerHTML = "";
  const chars: HTMLSpanElement[] = [];

  text.split(" ").forEach((word, wIndex, arr) => {
    const wrap = document.createElement("span");
    wrap.style.display = "inline-block";
    wrap.style.overflow = "hidden";

    word.split("").forEach((c) => {
      const span = document.createElement("span");
      span.textContent = c;
      span.className = "char inline-block";
      wrap.appendChild(span);
      chars.push(span);
    });

    el.appendChild(wrap);

    if (wIndex < arr.length - 1) {
      const space = document.createElement("span");
      space.textContent = " ";
      space.className = "char inline-block";
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
  // MEMOIZED RIBBON CONTENT (biar gak map setiap render)
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
          />
        )}
        <span className="text-sm sm:text-base md:text-lg tracking-wider uppercase font-centsbook text-whiteText/80">
          {stack.name}
        </span>
      </div>
    ));
  }, [stacks, isLoading, isEmpty]);

  // ===========================
  // INFINITE RIBBON LOOP (SEAMLESS) – useLayoutEffect
  // ===========================
  useLayoutEffect(() => {
    if (isEmpty || isLoading) return;

    const ribbonTweens: gsap.core.Tween[] = [];

    const createInfiniteRibbon = (
      wrapper: HTMLDivElement,
      baseSpeed: number,
      direction: "left" | "right" = "left"
    ) => {
      const track = wrapper.querySelector(
        ".ribbon-track"
      ) as HTMLElement | null;
      const firstSegment = wrapper.querySelector(
        ".ribbon-segment"
      ) as HTMLElement | null;

      if (!track || !firstSegment) return;

      const segmentWidth = firstSegment.offsetWidth;
      if (!segmentWidth) return;

      const duration = segmentWidth / baseSpeed;

      const fromX = direction === "left" ? 0 : -segmentWidth;
      const toX = direction === "left" ? -segmentWidth : 0;

      const tween = gsap.fromTo(
        track,
        { x: fromX },
        {
          x: toX,
          duration,
          ease: "none",
          repeat: -1,
        }
      );

      ribbonTweens.push(tween);
    };

    if (ribbonARef.current) {
      createInfiniteRibbon(ribbonARef.current, 50, "left");
    }

    if (ribbonBRef.current) {
      createInfiniteRibbon(ribbonBRef.current, 35, "right");
    }

    return () => {
      ribbonTweens.forEach((t) => t.kill());
    };
  }, [isEmpty, isLoading, ribbonARef, ribbonBRef]);

  // ===========================
  // TEXT & QUOTE ANIMATIONS – useLayoutEffect
  // ===========================
  useLayoutEffect(() => {
    const headerChars = topHeaderRefs.current.flatMap((el) =>
      el ? splitChars(el) : []
    );
    const fullstackChars = fullstackTitleRef.current
      ? splitChars(fullstackTitleRef.current)
      : [];
    const developerChars = developerTitleRef.current
      ? splitChars(developerTitleRef.current)
      : [];

    const tl = gsap.timeline({ delay: 0.3 });

    gsap.set(headerChars, { opacity: 0, y: "100%", force3D: true });
    gsap.set([...fullstackChars, ...developerChars], {
      opacity: 0,
      y: "100%",
      force3D: true,
    });
    if (profileImageRef.current) {
      gsap.set(profileImageRef.current, { opacity: 0, scale: 0.8 });
    }

    tl.to(headerChars, {
      opacity: 1,
      y: "0%",
      duration: 0.8,
      stagger: {
        amount: Math.min(0.02 * headerChars.length, 0.8),
      },
      ease: "power2.out",
    })
      .to(
        profileImageRef.current,
        { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.6
      )
      .to(
        fullstackChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: { amount: 0.4 },
        },
        1.0
      )
      .to(
        developerChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: { amount: 0.4 },
        },
        1.4
      );

    // Quote skew scroll animation
    let st: ScrollTrigger | null = null;
    let idleTimeout: number | undefined;

    if (
      quoteRef.current &&
      quoteContainerRef.current &&
      heroWrapperRef.current
    ) {
      const quote = quoteRef.current;
      const container = quoteContainerRef.current;
      const wrapper = heroWrapperRef.current;

      const textWidth = quote.scrollWidth;
      const containerWidth = container.clientWidth;
      const distance = Math.max(textWidth - containerWidth, 0);
      const viewport = window.innerHeight;
      const scrollSpan =
        distance > 0 ? Math.max(viewport * 0.9, distance * 0.45) : 0;

      gsap.set(wrapper, {
        minHeight: viewport + scrollSpan + viewport * 0.2,
      });

      if (distance > 0) {
        gsap.set(quote, { x: 0, skewX: 0 });

        const skewTo = gsap.quickTo(quote, "skewX", {
          duration: 0.3,
          ease: "power3.out",
        });

        let prevProgress = 0;
        let smoothedDelta = 0;

        st = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: `+=${scrollSpan}`,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;

            gsap.set(quote, {
              x: gsap.utils.mapRange(0, 1, 0, -distance, p),
            });

            const delta = p - prevProgress;
            prevProgress = p;
            smoothedDelta += (delta - smoothedDelta) * 0.35;

            const rawSkew = smoothedDelta * 1500;
            const targetSkew = gsap.utils.clamp(-55, 55, rawSkew);

            skewTo(targetSkew);

            if (idleTimeout) clearTimeout(idleTimeout);
            idleTimeout = window.setTimeout(() => skewTo(0), 120);
          },
        });
      }
    }

    return () => {
      tl.kill();
      if (st) st.kill();
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, []);

  // ===========================
  // RETURN JSX
  // ===========================
  return (
    <div ref={heroWrapperRef} className="relative bg-background2">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex flex-col h-full px-4 sm:px-8 lg:px-12">
          {/* Top Header */}
          <div className="flex justify-between items-start pt-8 sm:pt-12 lg:pt-16">
            <h1
              ref={setTopHeaderRef(0)}
              className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText"
            >
              A
            </h1>
            <h1
              ref={setTopHeaderRef(1)}
              className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText"
            >
              SERIOUSLY
            </h1>
            <h1
              ref={setTopHeaderRef(2)}
              className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText"
            >
              GOOD
            </h1>
          </div>

          {/* Main Title */}
          <div
            className="flex justify-center items-center relative z-10
            mt-2 sm:mt-3 md:mt-4 lg:mt-2 xl:mt-1
            flex-wrap"
          >
            <h1
              ref={fullstackTitleRef}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-ogg font-bold text-whiteText mr-4 sm:mr-6 lg:mr-8"
            >
              FULLSTACK
            </h1>
            <h1
              ref={developerTitleRef}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-ogg font-bold text-whiteText"
            >
              DEVELOPER
            </h1>
          </div>

          {/* RIBBONS — garis putih, tanpa background blur */}
          {!isEmpty && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              {/* Ribbon A */}
              <div
                ref={ribbonARef}
                className="absolute w-[180vw] h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden left-1/2 top-1/2 z-[1] border-y border-whiteText/35"
                style={{
                  transform: "translate(-50%, -50%) rotate(-12deg)",
                  transformOrigin: "center",
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
                  transform: "translate(-50%, -50%) rotate(12deg)",
                  transformOrigin: "center",
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
          <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none">
            <div
              ref={profileImageRef}
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 overflow-hidden"
            >
              <img
                src="/images/pp.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Quotes */}
        <div
          ref={quoteContainerRef}
          className="absolute bottom-1 left-0 right-0 w-full overflow-hidden z-10"
        >
          <div
            ref={quoteRef}
            className="inline-block whitespace-nowrap will-change-transform text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[160px] 2xl:text-[192px] text-whiteText font-ogg font-bold uppercase tracking-tight"
            style={{ lineHeight: "1.1", paddingLeft: "2px" }}
          >
            ELEVATING USER EXPERIENCES THROUGH OPTIMIZED CODE.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
