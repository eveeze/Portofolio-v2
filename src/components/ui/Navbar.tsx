import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

// Register the SplitText plugin
gsap.registerPlugin(SplitText);

interface AnimationData {
  timeline?: gsap.core.Timeline;
  originalSplit?: SplitText;
  duplicateSplit?: SplitText;
  isAnimating: boolean;
  currentState: "normal" | "hovered";
  targetState: "normal" | "hovered";
  element: HTMLElement;
}

const Navbar = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const [hasAnimatedEntrance, setHasAnimatedEntrance] = useState(false);
  const entranceTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Animation tracking for nav links only (excluding name/logo)
  const animationRefs = useRef<Map<HTMLElement, AnimationData>>(new Map());

  // Debounce timer for quick hovers
  const debounceTimers = useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map());

  const navItems = useMemo(
    () => [
      { path: "/", label: "HOME" },
      { path: "/work", label: "WORK" },
      { path: "/archive", label: "ARCHIVE" },
      { path: "/about", label: "ABOUT" },
      { path: "/contact", label: "CONTACT" },
    ],
    []
  );

  // Enhanced cleanup with proper state reset
  const cleanupAnimation = useCallback((element: HTMLElement) => {
    const animationData = animationRefs.current.get(element);
    if (animationData) {
      // Kill timeline
      if (animationData.timeline) {
        animationData.timeline.kill();
        animationData.timeline = undefined;
      }

      // Revert splits
      if (animationData.originalSplit) {
        animationData.originalSplit.revert();
        animationData.originalSplit = undefined;
      }
      if (animationData.duplicateSplit) {
        animationData.duplicateSplit.revert();
        animationData.duplicateSplit = undefined;
      }

      // Reset animation state
      animationData.isAnimating = false;
    }

    // Clear debounce timer
    const timer = debounceTimers.current.get(element);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.current.delete(element);
    }
  }, []);

  // FIXED: Single entrance animation without double effect
  useEffect(() => {
    if (!navRef.current || hasAnimatedEntrance) return;

    // Kill any existing entrance animation
    if (entranceTimelineRef.current) {
      entranceTimelineRef.current.kill();
    }

    // Set initial state
    gsap.set(navRef.current, {
      y: -30,
      opacity: 0,
      force3D: true,
    });

    // Get nav link elements
    const navLinks = navRef.current.querySelectorAll(
      ".nav-link .original-text"
    );
    const navLinkElements = Array.from(navLinks);

    // Get identity element
    const identity = navRef.current.querySelector(
      ".nav-identity"
    ) as HTMLElement | null;

    const showNavbar = () => {
      // Create single master timeline
      const masterTl = gsap.timeline({
        onComplete: () => {
          setHasAnimatedEntrance(true);
          entranceTimelineRef.current = null;
        },
      });

      entranceTimelineRef.current = masterTl;

      // Animate navbar container
      masterTl.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        force3D: true,
      });

      // Animate nav links with stagger (coordinated with navbar animation)
      if (navLinkElements.length > 0) {
        navLinkElements.forEach((link, index) => {
          const linkSplit = new SplitText(link, { type: "chars" });

          masterTl.fromTo(
            linkSplit.chars,
            {
              y: 15,
              opacity: 0,
              force3D: true,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
              delay: index * 0.15,
              force3D: true,
              stagger: {
                amount: 0.25,
                from: "start",
              },
              onComplete: () => {
                linkSplit.revert();
              },
            },
            0.4 // Start after navbar begins moving
          );
        });
      }

      // Animate identity text
      if (identity) {
        const identitySplit = new SplitText(identity, { type: "chars" });

        masterTl.fromTo(
          identitySplit.chars,
          {
            y: 10,
            opacity: 0,
            force3D: true,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            force3D: true,
            stagger: {
              amount: 0.3,
              from: "center",
            },
            onComplete: () => {
              identitySplit.revert();
            },
          },
          0.4 // Start at same time as nav links
        );
      }
    };

    const timer = setTimeout(showNavbar, 150);
    return () => {
      clearTimeout(timer);
      if (entranceTimelineRef.current) {
        entranceTimelineRef.current.kill();
        entranceTimelineRef.current = null;
      }
    };
  }, [hasAnimatedEntrance]);

  // Animation execution for nav links only - OPTIMIZED
  const executeAnimation = useCallback(
    (element: HTMLElement, targetState: "normal" | "hovered") => {
      const originalText = element.querySelector(
        ".original-text"
      ) as HTMLElement;
      const duplicateText = element.querySelector(
        ".duplicate-text"
      ) as HTMLElement;

      if (!originalText || !duplicateText) return;

      // Get or create animation data
      let animationData = animationRefs.current.get(element);
      if (!animationData) {
        animationData = {
          isAnimating: false,
          currentState: "normal",
          targetState: "normal",
          element: element,
        };
        animationRefs.current.set(element, animationData);
      }

      // Skip if already in target state and not animating
      if (
        !animationData.isAnimating &&
        animationData.currentState === targetState
      ) {
        return;
      }

      // If currently animating to same target, skip
      if (
        animationData.isAnimating &&
        animationData.targetState === targetState
      ) {
        return;
      }

      // Cleanup existing animation
      cleanupAnimation(element);

      // Update states
      animationData.isAnimating = true;
      animationData.targetState = targetState;

      // Animation parameters for nav links - OPTIMIZED durations
      const yOffset = 25;
      const duration = 0.22;
      const staggerAmount = 0.06;
      const overlap = 0.05;

      // Set hover color immediately for responsiveness
      if (targetState === "hovered") {
        element.style.color = "rgb(255 255 255)";
      }

      // Create timeline with proper cleanup - OPTIMIZED
      const tl = gsap.timeline({
        defaults: {
          force3D: true,
        },
        onComplete: () => {
          const data = animationRefs.current.get(element);
          if (data) {
            data.isAnimating = false;
            data.currentState = targetState;

            // Set final color state
            if (targetState === "normal") {
              const isActive = element.getAttribute("data-active") === "true";
              element.style.color = isActive
                ? "rgb(156 163 175)"
                : "rgb(255 255 255)";
            } else {
              element.style.color = "rgb(255 255 255)";
            }

            // Cleanup splits
            if (data.originalSplit) {
              data.originalSplit.revert();
              data.originalSplit = undefined;
            }
            if (data.duplicateSplit) {
              data.duplicateSplit.revert();
              data.duplicateSplit = undefined;
            }
          }
        },
        onInterrupt: () => {
          const data = animationRefs.current.get(element);
          if (data) {
            data.isAnimating = false;
            if (data.originalSplit) {
              data.originalSplit.revert();
              data.originalSplit = undefined;
            }
            if (data.duplicateSplit) {
              data.duplicateSplit.revert();
              data.duplicateSplit = undefined;
            }
          }
        },
      });

      // Create splits
      const originalSplit = new SplitText(originalText, { type: "chars" });
      const duplicateSplit = new SplitText(duplicateText, { type: "chars" });

      // Store in animation data
      animationData.timeline = tl;
      animationData.originalSplit = originalSplit;
      animationData.duplicateSplit = duplicateSplit;

      if (targetState === "hovered") {
        // Animate to hovered state
        tl.set([originalText, duplicateText], { opacity: 1 })
          .set(duplicateSplit.chars, { y: yOffset, opacity: 0 })
          .to(
            originalSplit.chars,
            {
              y: -yOffset,
              opacity: 0,
              duration: duration,
              ease: "power2.out",
              stagger: {
                amount: staggerAmount,
                from: "start",
              },
            },
            0
          )
          .to(
            duplicateSplit.chars,
            {
              y: 0,
              opacity: 1,
              duration: duration,
              ease: "power2.out",
              stagger: {
                amount: staggerAmount,
                from: "start",
              },
            },
            overlap
          );
      } else {
        // Animate to normal state
        tl.set([originalText, duplicateText], { opacity: 1 })
          .set(originalSplit.chars, { y: -yOffset, opacity: 0 })
          .to(
            duplicateSplit.chars,
            {
              y: yOffset,
              opacity: 0,
              duration: duration,
              ease: "power2.out",
              stagger: {
                amount: staggerAmount,
                from: "start",
              },
            },
            0
          )
          .to(
            originalSplit.chars,
            {
              y: 0,
              opacity: 1,
              duration: duration,
              ease: "power2.out",
              stagger: {
                amount: staggerAmount,
                from: "start",
              },
            },
            overlap
          );
      }
    },
    [cleanupAnimation]
  );

  // Debounced hover handlers for nav links only - OPTIMIZED timing
  const handleHoverWithDebounce = useCallback(
    (element: HTMLElement, targetState: "normal" | "hovered") => {
      // Clear existing timer
      const existingTimer = debounceTimers.current.get(element);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // For hover in, execute immediately for responsiveness
      if (targetState === "hovered") {
        executeAnimation(element, targetState);
      } else {
        // For hover out, minimal debounce
        const timer = setTimeout(() => {
          executeAnimation(element, targetState);
          debounceTimers.current.delete(element);
        }, 30);

        debounceTimers.current.set(element, timer);
      }
    },
    [executeAnimation]
  );

  // Reset all nav states except current element
  const resetOtherNavStates = useCallback(
    (currentElement: HTMLElement) => {
      animationRefs.current.forEach((data, element) => {
        if (
          element !== currentElement &&
          (data.isAnimating || data.currentState === "hovered")
        ) {
          handleHoverWithDebounce(element, "normal");
        }
      });
    },
    [handleHoverWithDebounce]
  );

  // Nav hover handlers
  const handleNavHover = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const linkElement = e.currentTarget;
      resetOtherNavStates(linkElement);
      handleHoverWithDebounce(linkElement, "hovered");
    },
    [resetOtherNavStates, handleHoverWithDebounce]
  );

  const handleNavLeave = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const linkElement = e.currentTarget;
      handleHoverWithDebounce(linkElement, "normal");
    },
    [handleHoverWithDebounce]
  );

  // Navbar mouse leave handler
  const handleNavbarMouseLeave = useCallback(() => {
    animationRefs.current.forEach((data) => {
      if (data.currentState === "hovered" || data.isAnimating) {
        handleHoverWithDebounce(data.element, "normal");
      }
    });
  }, [handleHoverWithDebounce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Kill entrance timeline if still running
      if (entranceTimelineRef.current) {
        entranceTimelineRef.current.kill();
        entranceTimelineRef.current = null;
      }

      // Cleanup all hover animations
      animationRefs.current.forEach((_, element) => {
        cleanupAnimation(element);
      });
      animationRefs.current.clear();

      debounceTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      debounceTimers.current.clear();
    };
  }, [cleanupAnimation]);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 left-0 right-0 z-50 font-centsbook transition-all duration-300 ease-out bg-transparent"
      onMouseLeave={handleNavbarMouseLeave}
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="relative flex items-center h-10 md:h-11 lg:h-12">
          {/* Left Side - Logo */}
          <div className="absolute left-0">
            <Link
              to="/"
              className="block transition-opacity duration-200 hover:opacity-80"
              style={{
                transform: "translateZ(0)",
              }}
            >
              <img
                src="/images/logo_final.png"
                alt="Tito Zaki Saputro"
                className="h-8 md:h-9 lg:h-10 w-auto"
                style={{
                  transform: "translateZ(0)",
                }}
              />
            </Link>
          </div>

          {/* Center - Identity Text (Absolute Center) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "calc(50% - 40px)",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="nav-identity text-xs md:text-sm tracking-[0.2em] uppercase text-gray-300 whitespace-nowrap">
              TITO ZAKI SAPUTRO / EVEEZE
            </span>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="absolute right-0">
            <ul className="flex items-center space-x-4 lg:space-x-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      data-active={isActive}
                      onMouseEnter={handleNavHover}
                      onMouseLeave={handleNavLeave}
                      className={`nav-link relative text-sm md:text-base font-normal tracking-wide uppercase whitespace-nowrap transition-colors duration-200 ease-out overflow-hidden block pointer-events-auto ${
                        isActive ? "text-gray-400" : "text-white"
                      }`}
                      style={{
                        textRendering: "optimizeLegibility",
                        fontSmooth: "always",
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <span
                        className="original-text block"
                        style={{
                          transform: "translateZ(0)",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="duplicate-text absolute top-0 left-0 opacity-0"
                        style={{
                          transform: "translateZ(0)",
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Enhanced underline effect */}
                      <span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 ease-out"
                        style={{
                          transformOrigin: "left center",
                          transform: "translateZ(0)",
                        }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
