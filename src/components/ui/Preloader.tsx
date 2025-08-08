import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface PreloaderProps {
  children: React.ReactNode;
}

const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  // Always show preloader on initial page load/refresh
  const [isLoading, setIsLoading] = useState(true);

  // Refs for animation elements
  const preloaderRef = useRef<HTMLDivElement>(null);
  const titoRef = useRef<HTMLDivElement>(null);
  const eveezeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optimized animation sequence
    const animatePreloader = () => {
      const tl = gsap.timeline();

      // Get character elements
      const titoChars = titoRef.current?.children || [];
      const eveezeChars = eveezeRef.current?.children || [];

      // Set initial states in batch for better performance
      gsap.set(containerRef.current, { opacity: 1 });
      gsap.set([titoRef.current, eveezeRef.current], { opacity: 1 });

      // Set character initial states
      gsap.set([...titoChars, ...eveezeChars], {
        opacity: 0,
        y: 100,
        rotationX: -90,
        transformOrigin: "center bottom",
      });

      // Set profile initial state
      gsap.set(profileRef.current, {
        opacity: 0,
        scale: 0.3,
        y: 30,
      });

      // Optimized animation sequence
      tl
        // Phase 1: Animate TITO characters
        .to(
          Array.from(titoChars),
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.7,
            ease: "back.out(1.3)",
            stagger: 0.1,
          },
          0.3
        )

        // Phase 2: Animate EVEEZE characters
        .to(
          Array.from(eveezeChars),
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.7,
            ease: "back.out(1.3)",
            stagger: 0.1,
          },
          0.6
        )

        // Phase 3: Brief pause
        .to({}, { duration: 0.8 })

        // Phase 4: Separate texts horizontally (parallel animation)
        .to(titoRef.current, {
          x: -250,
          duration: 0.8,
          ease: "power2.out",
        })
        .to(
          eveezeRef.current,
          {
            x: 300,
            duration: 0.8,
            ease: "power2.out",
          },
          "<"
        )

        // Phase 5: Show profile image
        .to(
          profileRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: "back.out(1.5)",
          },
          "-=0.4"
        )

        // Phase 6: Hold final state
        .to({}, { duration: 1 })

        // Phase 7: Exit animation sequence
        .to(titoRef.current, {
          y: "-100vh",
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        })
        .to(
          profileRef.current,
          {
            y: "-100vh",
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "-=0.4"
        )
        .to(
          eveezeRef.current,
          {
            y: "-100vh",
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "-=0.4"
        )

        // Hide container
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
        })

        // Complete loading
        .call(() => {
          setIsLoading(false);
        });
    };

    // Start animation with minimal delay
    const timeout = setTimeout(animatePreloader, 100);
    return () => clearTimeout(timeout);
  }, []); // Remove isLoading dependency since we always want to run this on mount

  // Don't render preloader if not loading
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Preloader */}
      <div
        ref={preloaderRef}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      >
        <div
          ref={containerRef}
          className="flex items-center justify-center opacity-0"
        >
          {/* TITO Text - Left side */}
          <div
            ref={titoRef}
            className="text-2xl md:text-4xl font-centsbook text-white tracking-wider select-none opacity-0"
          >
            <span className="inline-block">T</span>
            <span className="inline-block">I</span>
            <span className="inline-block">T</span>
            <span className="inline-block">O</span>
          </div>

          {/* EVEEZE Text - Right side */}
          <div
            ref={eveezeRef}
            className="text-2xl md:text-4xl font-centsbook text-white tracking-wider select-none opacity-0 ml-4"
          >
            <span className="inline-block">E</span>
            <span className="inline-block">V</span>
            <span className="inline-block">E</span>
            <span className="inline-block">E</span>
            <span className="inline-block">Z</span>
            <span className="inline-block">E</span>
          </div>

          {/* Profile Picture - Center */}
          <div
            ref={profileRef}
            className="w-56 h-56 md:w-72 md:h-72 overflow-hidden shadow-xl absolute opacity-0"
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

      {/* Main Content */}
      <div
        className={
          isLoading
            ? "opacity-0 pointer-events-none"
            : "opacity-100 transition-opacity duration-700 ease-out"
        }
      >
        {children}
      </div>
    </>
  );
};

export default Preloader;
