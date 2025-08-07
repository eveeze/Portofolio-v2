import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";

interface PreloaderProps {
  children: React.ReactNode;
}

const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Refs for animation elements
  const preloaderRef = useRef<HTMLDivElement>(null);
  const titoRef = useRef<HTMLDivElement>(null);
  const eveezeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Don't show preloader on admin routes
    if (isAdminRoute) {
      setIsLoading(false);
      return;
    }

    // Reset loading state when route changes (for non-admin routes)
    setIsLoading(true);

    // Start animation sequence
    const animatePreloader = () => {
      const tl = gsap.timeline();

      // Split text into individual characters for stagger animation
      const titoChars = titoRef.current?.children;
      const eveezeChars = eveezeRef.current?.children;

      // Ensure container is visible first
      gsap.set(containerRef.current, { opacity: 1 });

      // Set initial state for text containers (visible but positioned)
      gsap.set([titoRef.current, eveezeRef.current], {
        opacity: 1,
      });

      // Set initial state for characters
      if (titoChars && eveezeChars) {
        gsap.set([...titoChars, ...eveezeChars], {
          opacity: 0,
          y: 100,
          rotationX: -90,
          transformOrigin: "center bottom",
        });
      }

      // Set initial state for profile image
      gsap.set(profileRef.current, {
        opacity: 0,
        scale: 0.3,
        y: 30,
      });

      // Animation sequence
      tl
        // Phase 1: Animate TITO characters with stagger from bottom
        .to(
          [...Array.from(titoChars || [])],
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

        // Phase 2: Animate EVEEZE characters with stagger from bottom
        .to(
          [...Array.from(eveezeChars || [])],
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

        // Phase 3: Brief pause to let text settle
        .to({}, { duration: 0.8 })

        // Phase 4: Separate the texts horizontally to make space for profile image
        .to(titoRef.current, {
          x: -250, // Increased distance for better symmetry
          duration: 0.8,
          ease: "power2.out",
        })
        .to(
          eveezeRef.current,
          {
            x: 300, // Increased distance for better symmetry
            duration: 0.8,
            ease: "power2.out",
          },
          "<" // Start at the same time as TITO animation
        )

        // Phase 5: Show profile image from center with scale and fade
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

        // Phase 6: Hold the final state briefly
        .to({}, { duration: 1 })

        // Phase 7: Exit animation - slide elements out sequentially from left to up
        // First move TITO text up and out
        .to(titoRef.current, {
          y: "-100vh",
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        })

        // Then move profile image up and out
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

        // Finally move EVEEZE text up and out
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

        // Hide the entire container
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
        })

        // Complete loading
        .call(() => {
          setIsLoading(false);
        });
    };

    // Start animation after DOM is ready
    const timeout = setTimeout(animatePreloader, 150);
    return () => clearTimeout(timeout);
  }, [location.pathname, isAdminRoute]);

  // Don't render preloader for admin routes
  if (isAdminRoute || !isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Preloader */}
      <div
        ref={preloaderRef}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      >
        <div ref={containerRef} className="flex items-center justify-center">
          {/* Text Container - untuk positioning awal */}
          <div
            ref={textContainerRef}
            className="flex items-center justify-center gap-4"
          >
            {/* TITO Text - Left side */}
            <div
              ref={titoRef}
              className="text-2xl md:text-4xl font-centsbook text-white tracking-wider select-none"
            >
              <span className="inline-block">T</span>
              <span className="inline-block">I</span>
              <span className="inline-block">T</span>
              <span className="inline-block">O</span>
            </div>

            {/* EVEEZE Text - Right side */}
            <div
              ref={eveezeRef}
              className="text-2xl md:text-4xl font-centsbook text-white tracking-wider select-none"
            >
              <span className="inline-block">E</span>
              <span className="inline-block">V</span>
              <span className="inline-block">E</span>
              <span className="inline-block">E</span>
              <span className="inline-block">Z</span>
              <span className="inline-block">E</span>
            </div>
          </div>

          {/* Profile Picture - Center, bigger size */}
          <div
            ref={profileRef}
            className="w-56 h-56 md:w-72 md:h-72 overflow-hidden shadow-xl rounded-lg absolute"
          >
            <img
              src="/images/pp.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
              loading="eager"
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
