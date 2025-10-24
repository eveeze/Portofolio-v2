import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

// Register the SplitText plugin
gsap.registerPlugin(SplitText);

const Navbar = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const [hasAnimatedEntrance, setHasAnimatedEntrance] = useState(false);
  const [, setIsScrolled] = useState(false);

  // Animation tracking for nav links only (excluding name/logo)
  const animationRefs = useRef<
    Map<
      HTMLElement,
      {
        timeline?: gsap.core.Timeline;
        originalSplit?: SplitText;
        duplicateSplit?: SplitText;
        isAnimating: boolean;
        currentState: "normal" | "hovered";
        targetState: "normal" | "hovered";
        hoverStartTime?: number;
        element: HTMLElement;
      }
    >
  >(new Map());

  // Debounce timer for quick hovers
  const debounceTimers = useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map());

  const navItems = [
    { path: "/", label: "HOME" },
    { path: "/work", label: "WORK" },
    { path: "/archive", label: "ARCHIVE" },
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ];

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
      animationData.hoverStartTime = undefined;
    }

    // Clear debounce timer
    const timer = debounceTimers.current.get(element);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.current.delete(element);
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simplified entrance animation (no name animation)
  useEffect(() => {
    if (!navRef.current || hasAnimatedEntrance) return;

    gsap.set(navRef.current, {
      y: -30,
      opacity: 0,
    });

    const showNavbar = () => {
      const tl = gsap.timeline();

      tl.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      }).call(() => {
        // Only animate nav links, not the logo/name
        const navLinks = navRef.current?.querySelectorAll(
          ".nav-link .original-text"
        );

        if (navLinks) {
          const navLinkElements = Array.from(navLinks);
          if (navLinkElements.length > 0) {
            navLinkElements.forEach((link, index) => {
              const linkSplit = new SplitText(link, { type: "chars" });
              gsap.fromTo(
                linkSplit.chars,
                { y: 15, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.5,
                  ease: "power3.out",
                  delay: 0.4 + index * 0.15,
                  stagger: {
                    amount: 0.25,
                    from: "start",
                  },
                  onComplete: () => {
                    linkSplit.revert();
                  },
                }
              );
            });
          }
        }

        setHasAnimatedEntrance(true);
      });
    };

    const timer = setTimeout(showNavbar, 150);
    return () => clearTimeout(timer);
  }, [hasAnimatedEntrance]);

  // Animation execution for nav links only
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
      animationData.currentState = animationData.currentState;

      // Animation parameters for nav links
      const yOffset = 25;
      const duration = 0.25;
      const staggerAmount = 0.08;
      const overlap = 0.06;

      // Set hover color immediately for responsiveness
      if (targetState === "hovered") {
        element.style.color = "rgb(255 255 255)"; // white on hover
      }

      // Create timeline with proper cleanup
      const tl = gsap.timeline({
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
              ease: "power2.inOut",
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
              ease: "power2.inOut",
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
              ease: "power2.inOut",
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
              ease: "power2.inOut",
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

  // Debounced hover handlers for nav links only
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
        // For hover out, add small debounce to prevent flicker
        const timer = setTimeout(() => {
          executeAnimation(element, targetState);
          debounceTimers.current.delete(element);
        }, 50);

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

  // Nav hover handlers (no name hover handlers needed)
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
    animationRefs.current.forEach((data, element) => {
      if (data.currentState === "hovered" || data.isAnimating) {
        handleHoverWithDebounce(element, "normal");
      }
    });
  }, [handleHoverWithDebounce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
      className="fixed top-0 left-0 right-0 z-50 font-centsbook transition-all duration-300 ease-out"
      onMouseLeave={handleNavbarMouseLeave}
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 md:h-11 lg:h-12">
          {/* Left Side - Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="block transition-opacity duration-200 hover:opacity-80"
            >
              <img
                src="/images/logo_final.png"
                alt="Tito Zaki Saputro"
                className="h-8 md:h-9 lg:h-10 w-auto"
              />
            </Link>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="flex-shrink-0">
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
                      }}
                    >
                      <span className="original-text block">{item.label}</span>
                      <span className="duplicate-text absolute top-0 left-0 opacity-0">
                        {item.label}
                      </span>

                      {/* Enhanced underline effect */}
                      <span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 ease-out"
                        style={{ transformOrigin: "left center" }}
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
