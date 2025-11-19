import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  const topHeaderRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const fullstackTitleRef = useRef<HTMLHeadingElement>(null);
  const developerTitleRef = useRef<HTMLHeadingElement>(null);
  const profileImageRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteContainerRef = useRef<HTMLDivElement>(null);

  const setTopHeaderRef =
    (index: number) => (el: HTMLHeadingElement | null) => {
      topHeaderRefs.current[index] = el;
    };

  useEffect(() => {
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

    // ==== Prepare text ====
    const headerChars = topHeaderRefs.current.flatMap((el) =>
      el ? splitChars(el) : []
    );
    const fullstackChars = fullstackTitleRef.current
      ? splitChars(fullstackTitleRef.current)
      : [];
    const developerChars = developerTitleRef.current
      ? splitChars(developerTitleRef.current)
      : [];

    // ==== Entrance animation ====
    const tl = gsap.timeline({ delay: 0.3 });

    gsap.set(headerChars, { opacity: 0, y: "100%", force3D: true });
    gsap.set([...fullstackChars, ...developerChars], {
      opacity: 0,
      y: "100%",
      force3D: true,
    });
    gsap.set(profileImageRef.current, { opacity: 0, scale: 0.8 });

    tl.to(headerChars, {
      opacity: 1,
      y: "0%",
      duration: 0.8,
      stagger: {
        amount: Math.min(0.02 * headerChars.length, 0.8),
        ease: "power1.out",
      },
      ease: "power2.out",
      force3D: true,
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
          stagger: {
            amount: Math.min(0.02 * fullstackChars.length, 0.5),
            ease: "power1.out",
          },
          ease: "power2.out",
          force3D: true,
        },
        1.0
      )
      .to(
        developerChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: {
            amount: Math.min(0.02 * developerChars.length, 0.5),
            ease: "power1.out",
          },
          ease: "power2.out",
          force3D: true,
        },
        1.4
      );

    // ================================
    // QUOTE SCROLL + PROGRESS-BASED SKEW + IDLE RESET
    // ================================
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

      // Scroll span: cukup pendek biar 2–3 scroll udah kelar
      const scrollSpan =
        distance > 0 ? Math.max(viewport * 0.9, distance * 0.45) : 0;

      const extraHeight = viewport * 0.2;
      const totalHeight = viewport + scrollSpan + extraHeight;
      wrapper.style.minHeight = `${totalHeight}px`;

      if (distance > 0) {
        gsap.set(quote, {
          x: 0,
          skewX: 0,
          transformOrigin: "50% 100%",
        });

        const skewTo = gsap.quickTo(quote, "skewX", {
          duration: 0.3,
          ease: "power3.out",
        });

        // PROGRESS-BASED "VELOCITY"
        let prevProgress = 0;
        let smoothedDelta = 0;
        const smoothFactor = 0.35;

        const maxSkew = 60; // liar (punyamu)
        const intensity = 1500; // pengali delta → skew (punyamu)

        st = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: `+=${scrollSpan}`,
          scrub: 0.6,
          onUpdate: (self) => {
            const progress = self.progress;

            // Geser horizontal 0 → -distance
            const x = gsap.utils.mapRange(0, 1, 0, -distance, progress);
            gsap.set(quote, { x });

            // Delta progress frame ini
            const delta = progress - prevProgress;
            prevProgress = progress;

            // Smooth delta biar liquid
            smoothedDelta += (delta - smoothedDelta) * smoothFactor;

            // Hitung skew
            const rawSkew = smoothedDelta * intensity;
            const targetSkew = gsap.utils.clamp(-maxSkew, maxSkew, rawSkew);

            skewTo(targetSkew);

            // === IDLE TIMER: kalau tidak ada update baru dalam X ms → balikin ke 0 ===
            if (idleTimeout !== undefined) {
              window.clearTimeout(idleTimeout);
            }
            idleTimeout = window.setTimeout(() => {
              skewTo(0);
            }, 120); // 120ms setelah "gerak terakhir" → huruf balik tegak
          },
        });
      }
    }

    return () => {
      tl.kill();
      if (st) st.kill();
      if (idleTimeout !== undefined) {
        window.clearTimeout(idleTimeout);
      }
    };
  }, []);

  return (
    <div ref={heroWrapperRef} className="relative bg-background2">
      {/* Sticky hero supaya scroll ngerjain quotes dulu */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex flex-col h-full px-4 sm:px-8 lg:px-12">
          {/* Top Header */}
          <div className="flex justify-between items-start pt-8 sm:pt-12 lg:pt-16">
            <h1
              ref={setTopHeaderRef(0)}
              className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText leading-tight"
            >
              A
            </h1>
            <h1
              ref={setTopHeaderRef(1)}
              className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText leading-tight"
            >
              SERIOUSLY
            </h1>
            <h1
              ref={setTopHeaderRef(2)}
              className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText leading-tight"
            >
              GOOD
            </h1>
          </div>

          {/* Main Title */}
          <div className="flex justify-center items-center relative z-10 mt-4 sm:mt-0 lg:-mt-8 flex-wrap">
            <h1
              ref={fullstackTitleRef}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-ogg font-bold tracking-normal text-whiteText leading-tight text-center mr-4 sm:mr-6 lg:mr-8"
            >
              FULLSTACK
            </h1>
            <h1
              ref={developerTitleRef}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-ogg font-bold tracking-normal text-whiteText leading-tight text-center"
            >
              DEVELOPER
            </h1>
          </div>

          {/* Profile Image */}
          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            <div
              ref={profileImageRef}
              className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 overflow-hidden sm:rounded-none"
            >
              <img
                src="/images/pp.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Quotes */}
          <div
            ref={quoteContainerRef}
            className="absolute bottom-12 sm:bottom-16 lg:bottom-20 left-0 right-0 w-full overflow-hidden px-4 sm:px-8 lg:px-12 z-10"
          >
            <div
              ref={quoteRef}
              className="inline-block whitespace-nowrap will-change-transform
                         text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[160px]
                         text-whiteText font-ogg font-bold uppercase tracking-tight"
              style={{ lineHeight: "1.1" }}
            >
              CRAFTING SYSTEMS AND INTERFACES THAT MOVE FAST AND FEEL ALIVE.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
