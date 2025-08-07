import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";

const Navbar = () => {
  const location = useLocation();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const navItems = [
    { path: "/", label: "HOME" },
    { path: "/work", label: "WORK" },
    { path: "/archive", label: "ARCHIVE" },
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ];

  const getCurrentIndex = () => {
    return navItems.findIndex((item) => item.path === location.pathname);
  };

  const moveBackground = (index: number, immediate = false) => {
    if (backgroundRef.current && navRef.current) {
      const navLinks = navRef.current.querySelectorAll("a");
      const targetLink = navLinks[index] as HTMLElement;

      if (targetLink) {
        const container = navRef.current.querySelector(
          "div.relative"
        ) as HTMLElement;

        // Force multiple layout calculations
        container.offsetHeight;
        targetLink.offsetWidth;

        // Wait for next frame to ensure layout is complete
        requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetLink.getBoundingClientRect();

          // Calculate exact position relative to container
          const targetX = targetRect.left - containerRect.left - 4; // 4px for container padding
          const targetWidth = targetRect.width;

          if (immediate) {
            gsap.set(backgroundRef.current, {
              x: targetX,
              width: targetWidth,
            });
          } else {
            gsap.to(backgroundRef.current, {
              x: targetX,
              width: targetWidth,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        });
      }
    }
  };

  const initializePosition = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex >= 0 && navRef.current) {
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        moveBackground(currentIndex, true);
        setIsInitialized(true);
      }, 100);
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredItem(index);
    moveBackground(index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    const currentIndex = getCurrentIndex();
    if (currentIndex >= 0) {
      moveBackground(currentIndex);
    }
  };

  // Initialize position when component mounts
  useEffect(() => {
    initializePosition();
  }, []);

  // Reinitialize when location changes
  useEffect(() => {
    setIsInitialized(false);
    // Use multiple timeouts to ensure positioning works
    const timeouts = [50, 100, 200, 400];

    timeouts.forEach((delay) => {
      setTimeout(() => {
        const currentIndex = getCurrentIndex();
        if (currentIndex >= 0) {
          moveBackground(currentIndex, true);
          if (delay === 400) {
            setIsInitialized(true);
          }
        }
      }, delay);
    });
  }, [location.pathname]);

  // Handle window resize to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      if (isInitialized) {
        const currentIndex = getCurrentIndex();
        if (currentIndex >= 0) {
          setTimeout(() => moveBackground(currentIndex, true), 50);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isInitialized]);

  // Animate navbar entrance
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.8,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.5,
          onComplete: () => {
            // Ensure position is correct after animation
            setTimeout(() => {
              const currentIndex = getCurrentIndex();
              if (currentIndex >= 0) {
                moveBackground(currentIndex, true);
              }
            }, 50);
          },
        }
      );
    }
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 font-centsbook w-fit"
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative bg-black/30 backdrop-blur-md rounded-full px-1 py-1 border border-white/10 shadow-2xl">
        {/* Animated background */}
        <div
          ref={backgroundRef}
          className="absolute top-1 left-1 h-10 bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
          style={{
            width: "60px",
            opacity: isInitialized ? 1 : 0, // Hide until properly positioned
          }}
        />

        {/* Navigation items */}
        <ul className="relative flex items-center">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === index;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative px-6 py-2.5 text-sm font-bold tracking-wide transition-colors duration-300 rounded-full block uppercase whitespace-nowrap ${
                    isHovered
                      ? "text-black"
                      : isActive && hoveredItem === null
                        ? "text-black"
                        : "text-white/70"
                  }`}
                  onMouseEnter={() => handleMouseEnter(index)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
