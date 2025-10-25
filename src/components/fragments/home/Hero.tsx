import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Hero: React.FC = () => {
  const topHeaderRefs = useRef<HTMLHeadingElement[]>([]);
  const fullstackTitleRef = useRef<HTMLHeadingElement>(null);
  const developerTitleRef = useRef<HTMLHeadingElement>(null);
  const profileImageRef = useRef<HTMLDivElement>(null);
  const leftDescriptionRef = useRef<HTMLDivElement>(null);
  const rightBrandRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // === FUNGSI-FUNGSI HELPER (SESUAI KODE LAMA ANDA) ===
    const splitTextIntoChars = (element: HTMLElement) => {
      const text = element.textContent || "";
      element.innerHTML = "";
      const charElements: HTMLSpanElement[] = [];
      const words = text.split(" ");
      words.forEach((word, wordIndex) => {
        const wordContainer = document.createElement("span");
        wordContainer.className = "word inline-block";
        wordContainer.style.overflow = "hidden";
        wordContainer.style.display = "inline-block";

        word.split("").forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.className = "char inline-block";
          wordContainer.appendChild(span);
          charElements.push(span);
        });
        element.appendChild(wordContainer);

        // FIXED: Add actual space between words
        if (wordIndex < words.length - 1) {
          const spaceSpan = document.createElement("span");
          spaceSpan.textContent = " ";
          spaceSpan.className = "char inline-block";
          element.appendChild(spaceSpan);
          charElements.push(spaceSpan);
        }
      });
      return charElements;
    };

    const getDescriptionParagraphs = (containerElement: HTMLElement) => {
      const paragraphs = containerElement.querySelectorAll("p");
      const paragraphElements: HTMLParagraphElement[] = [];
      paragraphs.forEach((p) => {
        const paragraphContainer = document.createElement("div");
        paragraphContainer.className = "paragraph-container";
        paragraphContainer.style.overflow = "hidden";
        p.parentNode?.insertBefore(paragraphContainer, p);
        paragraphContainer.appendChild(p);
        paragraphElements.push(p as HTMLParagraphElement);
      });
      return paragraphElements;
    };

    // === PERSIAPAN SEMUA ELEMEN UNTUK ANIMASI ===
    const topHeaderChars = topHeaderRefs.current.flatMap((el) =>
      el ? splitTextIntoChars(el) : []
    );

    // Split title chars menjadi dua array terpisah
    const fullstackTitleChars = fullstackTitleRef.current
      ? splitTextIntoChars(fullstackTitleRef.current)
      : [];
    const developerTitleChars = developerTitleRef.current
      ? splitTextIntoChars(developerTitleRef.current)
      : [];

    const leftDescriptionParagraphs = leftDescriptionRef.current
      ? getDescriptionParagraphs(leftDescriptionRef.current)
      : [];
    const rightBrandChars = rightBrandRef.current
      ? splitTextIntoChars(rightBrandRef.current)
      : [];

    // === TIMELINE ANIMASI MASUK (ENTRANCE ANIMATION) DARI KODE LAMA ANDA ===
    const entranceTl = gsap.timeline({ delay: 0.3 });

    // Set initial states
    gsap.set(topHeaderChars, { opacity: 0, y: "100%", force3D: true });
    gsap.set([...fullstackTitleChars, ...developerTitleChars], {
      opacity: 0,
      y: "100%",
      force3D: true,
    });
    gsap.set(leftDescriptionParagraphs, {
      opacity: 0,
      y: "100%",
      force3D: true,
    });
    gsap.set(rightBrandChars, { opacity: 0, y: "100%", force3D: true });
    gsap.set(profileImageRef.current, { opacity: 0, scale: 0.8 });

    entranceTl
      .to(
        topHeaderChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: {
            amount: Math.min(0.02 * topHeaderChars.length, 0.8),
            ease: "power1.out",
          },
          ease: "power2.out",
          force3D: true,
        },
        0.2
      )
      .to(
        profileImageRef.current,
        { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.6
      )
      // Animasi FULLSTACK dulu
      .to(
        fullstackTitleChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: {
            amount: Math.min(0.02 * fullstackTitleChars.length, 0.5),
            ease: "power1.out",
          },
          ease: "power2.out",
          force3D: true,
        },
        1.0
      )
      .to(
        developerTitleChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: {
            amount: Math.min(0.02 * developerTitleChars.length, 0.5),
            ease: "power1.out",
          },
          ease: "power2.out",
          force3D: true,
        },
        1.4
      )
      .to(
        leftDescriptionParagraphs,
        {
          opacity: 1,
          y: "0%",
          duration: 0.6,
          stagger: { amount: 0.6, ease: "power1.out" },
          ease: "power2.out",
          force3D: true,
        },
        2.0
      )
      .to(
        rightBrandChars,
        {
          opacity: 1,
          y: "0%",
          duration: 0.8,
          stagger: {
            amount: Math.min(0.03 * rightBrandChars.length, 0.6),
            ease: "power1.out",
          },
          ease: "power2.out",
          force3D: true,
        },
        2.6
      );

    return () => {
      entranceTl.kill();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="flex flex-col h-full px-4 sm:px-8 lg:px-12">
        {/* Top Header */}
        <div className="flex justify-between items-start pt-8 sm:pt-12 lg:pt-16">
          <h1
            ref={(el) => {
              if (el) topHeaderRefs.current[0] = el;
            }}
            className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText leading-tight"
          >
            A
          </h1>
          <h1
            ref={(el) => {
              if (el) topHeaderRefs.current[1] = el;
            }}
            className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText leading-tight"
          >
            SERIOUSLY
          </h1>
          <h1
            ref={(el) => {
              if (el) topHeaderRefs.current[2] = el;
            }}
            className="text-2xl sm:text-3xl lg:text-4xl font-ogg font-bold tracking-tighter text-grayText leading-tight"
          >
            GOOD
          </h1>
        </div>

        {/* Main Title - Inline berdampingan */}
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
        <div className="absolute inset-0 flex items-center justify-center z-0">
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

        {/* Left Description */}
        <div
          ref={leftDescriptionRef}
          className="absolute left-4 sm:left-8 lg:left-12 max-w-xs z-10"
          style={{ bottom: "3rem" }}
        >
          <p className="text-sm sm:text-base md:text-lg font-centsbook text-grayText tracking-tighter leading-tight mb-0">
            I AM TITO ZAKI SAPUTRO
          </p>
          <p className="text-sm sm:text-base md:text-lg font-centsbook text-grayText tracking-tighter leading-tight mb-0">
            ALSO KNOWN AS EVEEZE
          </p>
          <p className="text-sm sm:text-base md:text-lg font-centsbook text-grayText tracking-tighter leading-tight mb-0">
            SPECIALISED IN MODERN
          </p>
          <p className="text-sm sm:text-base md:text-lg font-centsbook text-grayText tracking-tighter leading-tight mb-0">
            FRONTEND AND BACKEND
          </p>
          <p className="text-sm sm:text-base md:text-lg font-centsbook text-grayText tracking-tighter leading-tight mb-0">
            TECHNOLOGIES TO CREATE
          </p>
          <p className="text-sm sm:text-base md:text-lg font-centsbook text-grayText tracking-tighter leading-tight mb-0">
            SEAMLESS DIGITAL EXPERIENCES.
          </p>
        </div>

        {/* Right Brand Name */}
        <div
          className="absolute right-4 sm:right-8 lg:right-12 z-10"
          style={{ bottom: "2.9rem" }}
        >
          <h1
            ref={rightBrandRef}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[160px] text-whiteText font-ogg leading-none"
            style={{ lineHeight: "0.7" }}
          >
            EVEEZE
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Hero;
