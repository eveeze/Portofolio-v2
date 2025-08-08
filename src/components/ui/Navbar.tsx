import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";

const Navbar = () => {
  const location = useLocation();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasAnimatedEntrance, setHasAnimatedEntrance] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const navItems = [
    { path: "/", label: "HOME" },
    { path: "/work", label: "WORK" },
    { path: "/archive", label: "ARCHIVE" },
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ];

  const getCurrentIndex = useCallback(() => {
    return navItems.findIndex((item) => item.path === location.pathname);
  }, [location.pathname]);

  const moveBackground = useCallback((index: number, immediate = false) => {
    if (!backgroundRef.current || !containerRef.current) return;

    const navLinks = containerRef.current.querySelectorAll("a");
    const targetLink = navLinks[index] as HTMLElement;
    if (!targetLink) return;

    // Force reflow to get accurate measurements
    containerRef.current.offsetHeight;
    targetLink.offsetWidth;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetLink.getBoundingClientRect();

    // Calculate position with proper offset
    const targetX = targetRect.left - containerRect.left - 4;
    const targetWidth = targetRect.width;

    // Ensure we have valid measurements
    if (targetWidth <= 0) {
      console.warn("Invalid target width:", targetWidth);
      return;
    }

    // Kill any existing animation for smoother transitions
    if (animationRef.current) {
      animationRef.current.kill();
    }

    // Always show the background when moving it
    gsap.set(backgroundRef.current, { opacity: 1 });

    if (immediate) {
      gsap.set(backgroundRef.current, {
        x: targetX,
        width: targetWidth,
        force3D: true,
      });
    } else {
      // Enhanced animation with better easing and faster speed
      animationRef.current = gsap.to(backgroundRef.current, {
        x: targetX,
        width: targetWidth,
        duration: 0.25, // Reduced from 0.35 to 0.25 for faster animation
        ease: "power3.out", // Changed to power3.out for smoother, more responsive feel
        force3D: true,
        overwrite: "auto",
        // Add motion blur effect for ultra-smooth perception
        onUpdate: function () {
          // Ensure sub-pixel rendering for maximum smoothness
          const progress = this.progress();
          if (progress < 1) {
            gsap.set(backgroundRef.current, {
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
            });
          }
        },
      });
    }
  }, []);

  // Initialize background position after DOM is fully ready
  useLayoutEffect(() => {
    if (!backgroundRef.current || !containerRef.current) return;

    // Enhanced initial setup with better hardware acceleration
    gsap.set(backgroundRef.current, {
      opacity: 0,
      width: 0,
      x: 0,
      force3D: true,
      transformOrigin: "left center",
      backfaceVisibility: "hidden",
      // Add will-change via GSAP for better performance
      willChange: "transform, width, opacity",
    });

    const initializeBackground = () => {
      const currentIndex = getCurrentIndex();
      if (currentIndex >= 0) {
        // Force a reflow to ensure all styles are applied
        containerRef.current!.offsetHeight;

        const navLinks = containerRef.current!.querySelectorAll("a");
        const targetLink = navLinks[currentIndex] as HTMLElement;

        if (targetLink) {
          // Force reflow on target element
          targetLink.offsetWidth;

          // Get computed style to ensure CSS is fully applied
          const computedStyle = window.getComputedStyle(targetLink);
          const paddingLeft = parseFloat(computedStyle.paddingLeft);
          const paddingRight = parseFloat(computedStyle.paddingRight);

          if (paddingLeft > 0 && paddingRight > 0) {
            // Measure after ensuring styles are applied
            const containerRect = containerRef.current!.getBoundingClientRect();
            const targetRect = targetLink.getBoundingClientRect();

            if (
              containerRect.width > 0 &&
              targetRect.width > 0 &&
              targetRect.height > 0
            ) {
              // Use setTimeout to ensure measurement is accurate
              setTimeout(() => {
                moveBackground(currentIndex, true);
                setIsInitialized(true);
              }, 0);
              return true;
            }
          }
        }
      }
      return false;
    };

    // Reset initialization state when route changes
    setIsInitialized(false);

    // Use different strategies for initialization
    const strategies = [
      // Strategy 1: Immediate
      () => requestAnimationFrame(initializeBackground),
      // Strategy 2: After short delay
      () => setTimeout(() => requestAnimationFrame(initializeBackground), 16),
      // Strategy 3: After longer delay
      () => setTimeout(() => requestAnimationFrame(initializeBackground), 50),
      // Strategy 4: Force with even longer delay
      () =>
        setTimeout(() => {
          const currentIndex = getCurrentIndex();
          if (currentIndex >= 0) {
            moveBackground(currentIndex, true);
            setIsInitialized(true);
          }
        }, 200),
    ];

    let currentStrategy = 0;
    const maxStrategies = strategies.length;

    const tryNextStrategy = () => {
      if (currentStrategy < maxStrategies && !isInitialized) {
        strategies[currentStrategy]();
        currentStrategy++;

        // Check if initialization succeeded after a delay
        if (currentStrategy < maxStrategies) {
          setTimeout(() => {
            if (!isInitialized) {
              tryNextStrategy();
            }
          }, 100);
        }
      }
    };

    // Start with first strategy
    tryNextStrategy();
  }, [location.pathname, getCurrentIndex, moveBackground]);

  // Enhanced navbar entrance animation with smoother timing
  useEffect(() => {
    if (!navRef.current || hasAnimatedEntrance) return;

    // Enhanced initial state with better hardware acceleration
    gsap.set(navRef.current, {
      y: 80,
      opacity: 0,
      scale: 0.9,
      transformOrigin: "center bottom",
      force3D: true,
      backfaceVisibility: "hidden",
      willChange: "transform, opacity",
    });

    // Smoother and slightly faster entrance animation
    const showNavbar = () => {
      gsap.to(navRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6, // Reduced from 0.8 to 0.6 for faster entrance
        ease: "back.out(1.1)", // Slightly reduced bounce for smoother feel
        delay: 0.1, // Reduced delay from 0.2 to 0.1
        force3D: true,
        onComplete: () => {
          setHasAnimatedEntrance(true);
          // Clean up will-change after animation
          gsap.set(navRef.current, { willChange: "auto" });
        },
      });
    };

    if (isInitialized) {
      showNavbar();
    } else {
      // Fallback: show navbar after timeout even if not initialized
      const fallbackTimer = setTimeout(showNavbar, 500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isInitialized, hasAnimatedEntrance]);

  // Update background when route changes (fix for missing background)
  useEffect(() => {
    if (isInitialized) {
      const currentIndex = getCurrentIndex();
      if (currentIndex >= 0) {
        // Reduced delay for faster route change response
        setTimeout(() => {
          moveBackground(currentIndex, true);
        }, 25); // Reduced from 50ms to 25ms
      }
    }
  }, [location.pathname, isInitialized, getCurrentIndex, moveBackground]);

  // Optimized resize handler with faster response
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          const currentIndex = getCurrentIndex();
          if (currentIndex >= 0) {
            // Force re-measurement on resize
            moveBackground(currentIndex, true);
          }
        });
      }, 75); // Reduced from 100ms to 75ms for faster resize response
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [getCurrentIndex, moveBackground]);

  const handleMouseEnter = useCallback(
    (index: number) => {
      // Use immediate requestAnimationFrame for instant response
      requestAnimationFrame(() => {
        setHoveredItem(index);
        moveBackground(index);
      });
    },
    [moveBackground]
  );

  const handleMouseLeave = useCallback(() => {
    // Use immediate requestAnimationFrame for instant response
    requestAnimationFrame(() => {
      setHoveredItem(null);
      const currentIndex = getCurrentIndex();
      if (currentIndex >= 0) moveBackground(currentIndex);
    });
  }, [getCurrentIndex, moveBackground]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 font-centsbook w-fit"
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={containerRef}
        className="relative bg-black/30 backdrop-blur-md rounded-full px-1 py-1 border border-white/10 shadow-2xl"
      >
        {/* Enhanced animated background with better performance */}
        <div
          ref={backgroundRef}
          className="absolute top-1 left-1 h-10 bg-white rounded-full shadow-lg"
          style={{
            width: "0px",
            transform: "translateX(0px)",
            willChange: "transform, width",
            backfaceVisibility: "hidden",
            perspective: 1000,
            opacity: 0,
            // Enhanced smoothness with better positioning
            transformOrigin: "left center",
            contain: "layout style paint",
          }}
        />

        {/* Navigation items with enhanced transitions */}
        <ul className="relative flex items-center">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === index;

            const shouldBeBlack =
              isHovered || (isActive && hoveredItem === null);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative px-6 py-2.5 text-sm font-bold tracking-wide rounded-full block uppercase whitespace-nowrap transition-colors duration-200 ease-out ${
                    shouldBeBlack ? "text-black" : "text-white/70"
                  }`} // Reduced transition duration from 300ms to 200ms
                  onMouseEnter={() => handleMouseEnter(index)}
                  style={{
                    willChange: "color",
                    backfaceVisibility: "hidden",
                    // Enhanced text rendering for smoother color transitions
                    textRendering: "optimizeLegibility",
                    fontSmooth: "always",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                  }}
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
