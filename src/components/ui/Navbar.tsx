import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type React from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useLenisContext } from "../../providers/LenisProvider";

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
  const navRef = useRef<HTMLDivElement>(null);
  const [hasAnimatedEntrance, setHasAnimatedEntrance] = useState(false);
  const entranceTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const animationRefs = useRef<Map<HTMLElement, AnimationData>>(new Map());
  const debounceTimers = useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map());

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const menuTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const menuItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const menuArrowRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Refs untuk hamburger icon animation
  const hamburgerTopRef = useRef<HTMLSpanElement | null>(null);
  const hamburgerMiddleRef = useRef<HTMLSpanElement | null>(null);
  const hamburgerBottomRef = useRef<HTMLSpanElement | null>(null);

  const { lenis } = useLenisContext();

  const navItems = useMemo(
    () => [
      { path: "/", label: "HOME" },
      { path: "/work", label: "WORK" },
      { path: "/archive", label: "BLOG" },
      { path: "/about", label: "ABOUT" },
      { path: "/contact", label: "CONTACT" },
    ],
    []
  );

  const setMenuItemRef = (index: number) => (el: HTMLDivElement | null) => {
    menuItemRefs.current[index] = el;
  };

  const setMenuArrowRef = (index: number) => (el: HTMLSpanElement | null) => {
    menuArrowRefs.current[index] = el;
  };

  // ========== DESKTOP CLEANUP ==========
  const cleanupAnimation = useCallback((element: HTMLElement) => {
    const animationData = animationRefs.current.get(element);
    if (animationData) {
      if (animationData.timeline) {
        animationData.timeline.kill();
        animationData.timeline = undefined;
      }
      if (animationData.originalSplit) {
        animationData.originalSplit.revert();
        animationData.originalSplit = undefined;
      }
      if (animationData.duplicateSplit) {
        animationData.duplicateSplit.revert();
        animationData.duplicateSplit = undefined;
      }
      animationData.isAnimating = false;
    }

    const timer = debounceTimers.current.get(element);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.current.delete(element);
    }
  }, []);

  // ========== NAVBAR ENTRANCE ==========
  useEffect(() => {
    if (!navRef.current || hasAnimatedEntrance) return;

    if (entranceTimelineRef.current) {
      entranceTimelineRef.current.kill();
    }

    gsap.set(navRef.current, {
      y: -20,
      opacity: 0,
      force3D: true,
    });

    const navLinks = navRef.current.querySelectorAll(
      ".nav-link .original-text"
    );
    const navLinkElements = Array.from(navLinks);
    const identity = navRef.current.querySelector(
      ".nav-identity"
    ) as HTMLElement | null;

    const showNavbar = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          setHasAnimatedEntrance(true);
          entranceTimelineRef.current = null;
        },
      });

      entranceTimelineRef.current = tl;

      tl.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        force3D: true,
      });

      if (navLinkElements.length > 0) {
        navLinkElements.forEach((link, index) => {
          const linkSplit = new SplitText(link, { type: "chars" });

          tl.fromTo(
            linkSplit.chars,
            {
              y: 10,
              opacity: 0,
              force3D: true,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              ease: "power3.out",
              delay: index * 0.08,
              force3D: true,
              stagger: {
                amount: 0.2,
                from: "start",
              },
              onComplete: () => {
                linkSplit.revert();
              },
            },
            0.3
          );
        });
      }

      if (identity) {
        const identitySplit = new SplitText(identity, { type: "chars" });

        tl.fromTo(
          identitySplit.chars,
          {
            y: 8,
            opacity: 0,
            force3D: true,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            force3D: true,
            stagger: {
              amount: 0.25,
              from: "center",
            },
            onComplete: () => {
              identitySplit.revert();
            },
          },
          0.3
        );
      }
    };

    const timer = setTimeout(showNavbar, 120);
    return () => {
      clearTimeout(timer);
      if (entranceTimelineRef.current) {
        entranceTimelineRef.current.kill();
        entranceTimelineRef.current = null;
      }
    };
  }, [hasAnimatedEntrance]);

  // ========== DESKTOP HOVER ==========
  const executeAnimation = useCallback(
    (element: HTMLElement, targetState: "normal" | "hovered") => {
      const originalText = element.querySelector(
        ".original-text"
      ) as HTMLElement;
      const duplicateText = element.querySelector(
        ".duplicate-text"
      ) as HTMLElement;

      if (!originalText || !duplicateText) return;

      let animationData = animationRefs.current.get(element);
      if (!animationData) {
        animationData = {
          isAnimating: false,
          currentState: "normal",
          targetState: "normal",
          element,
        };
        animationRefs.current.set(element, animationData);
      }

      if (
        !animationData.isAnimating &&
        animationData.currentState === targetState
      ) {
        return;
      }

      if (
        animationData.isAnimating &&
        animationData.targetState === targetState
      ) {
        return;
      }

      cleanupAnimation(element);

      animationData.isAnimating = true;
      animationData.targetState = targetState;

      const yOffset = 18;
      const duration = 0.18;
      const staggerAmount = 0.05;
      const overlap = 0.04;

      const tl = gsap.timeline({
        defaults: {
          force3D: true,
        },
        onComplete: () => {
          const data = animationRefs.current.get(element);
          if (data) {
            data.isAnimating = false;
            data.currentState = targetState;

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

      const originalSplit = new SplitText(originalText, { type: "chars" });
      const duplicateSplit = new SplitText(duplicateText, { type: "chars" });

      animationData.timeline = tl;
      animationData.originalSplit = originalSplit;
      animationData.duplicateSplit = duplicateSplit;

      if (targetState === "hovered") {
        tl.set([originalText, duplicateText], { opacity: 1 })
          .set(duplicateSplit.chars, { y: yOffset, opacity: 0 })
          .to(
            originalSplit.chars,
            {
              y: -yOffset,
              opacity: 0,
              duration,
              ease: "power2.out",
              stagger: { amount: staggerAmount, from: "start" },
            },
            0
          )
          .to(
            duplicateSplit.chars,
            {
              y: 0,
              opacity: 1,
              duration,
              ease: "power2.out",
              stagger: { amount: staggerAmount, from: "start" },
            },
            overlap
          );
      } else {
        tl.set([originalText, duplicateText], { opacity: 1 })
          .set(originalSplit.chars, { y: -yOffset, opacity: 0 })
          .to(
            duplicateSplit.chars,
            {
              y: yOffset,
              opacity: 0,
              duration,
              ease: "power2.out",
              stagger: { amount: staggerAmount, from: "start" },
            },
            0
          )
          .to(
            originalSplit.chars,
            {
              y: 0,
              opacity: 1,
              duration: 0.2,
              ease: "power2.out",
              stagger: { amount: staggerAmount, from: "start" },
            },
            overlap
          );
      }
    },
    [cleanupAnimation]
  );

  const handleHoverWithDebounce = useCallback(
    (element: HTMLElement, targetState: "normal" | "hovered") => {
      const existingTimer = debounceTimers.current.get(element);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      if (targetState === "hovered") {
        executeAnimation(element, targetState);
      } else {
        const timer = setTimeout(() => {
          executeAnimation(element, targetState);
          debounceTimers.current.delete(element);
        }, 30);

        debounceTimers.current.set(element, timer);
      }
    },
    [executeAnimation]
  );

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

  const handleNavHover = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const linkElement = e.currentTarget;
      resetOtherNavStates(linkElement);
      handleHoverWithDebounce(linkElement, "hovered");
    },
    [resetOtherNavStates, handleHoverWithDebounce]
  );

  const handleNavLeave = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const linkElement = e.currentTarget;
      handleHoverWithDebounce(linkElement, "normal");
    },
    [handleHoverWithDebounce]
  );

  const handleNavbarMouseLeave = useCallback(() => {
    animationRefs.current.forEach((data) => {
      if (data.currentState === "hovered" || data.isAnimating) {
        handleHoverWithDebounce(data.element, "normal");
      }
    });
  }, [handleHoverWithDebounce]);

  // ========== HAMBURGER ICON ANIMATION ==========
  const animateHamburgerIcon = useCallback((toOpen: boolean) => {
    const top = hamburgerTopRef.current;
    const middle = hamburgerMiddleRef.current;
    const bottom = hamburgerBottomRef.current;

    if (!top || !middle || !bottom) return;

    // Kill any existing animations
    gsap.killTweensOf([top, middle, bottom]);

    if (toOpen) {
      // Transform ke X
      gsap.to(top, {
        y: 0,
        rotate: 45,
        duration: 0.3,
        ease: "power2.inOut",
        force3D: true,
      });
      gsap.to(middle, {
        opacity: 0,
        scale: 0,
        duration: 0.2,
        ease: "power2.inOut",
        force3D: true,
      });
      gsap.to(bottom, {
        y: 0,
        rotate: -45,
        duration: 0.3,
        ease: "power2.inOut",
        force3D: true,
      });
    } else {
      // Transform balik ke hamburger (3 garis)
      gsap.to(top, {
        y: -5,
        rotate: 0,
        duration: 0.3,
        ease: "power2.inOut",
        force3D: true,
      });
      gsap.to(middle, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.inOut",
        force3D: true,
      });
      gsap.to(bottom, {
        y: 5,
        rotate: 0,
        duration: 0.3,
        ease: "power2.inOut",
        force3D: true,
      });
    }
  }, []);

  // ========== MOBILE MENU SETUP ==========
  useEffect(() => {
    if (menuOverlayRef.current) {
      gsap.set(menuOverlayRef.current, {
        autoAlpha: 0,
        pointerEvents: "none",
        force3D: true,
      });
    }

    if (bubbleRef.current) {
      gsap.set(bubbleRef.current, {
        scale: 0.2,
        transformOrigin: "100% 0%",
        willChange: "transform",
        force3D: true,
      });
    }

    menuArrowRefs.current.forEach((arrow) => {
      if (arrow) {
        gsap.set(arrow, {
          rotate: 0,
          x: 0,
          y: 0,
          transformOrigin: "center center",
          force3D: true,
        });
      }
    });

    // Initial hamburger setup
    if (hamburgerTopRef.current) {
      gsap.set(hamburgerTopRef.current, { y: -5, rotate: 0, force3D: true });
    }
    if (hamburgerMiddleRef.current) {
      gsap.set(hamburgerMiddleRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        force3D: true,
      });
    }
    if (hamburgerBottomRef.current) {
      gsap.set(hamburgerBottomRef.current, { y: 5, rotate: 0, force3D: true });
    }
  }, []);

  // ========== STOP / START LENIS ==========
  useEffect(() => {
    if (!lenis) return;
    if (isMenuOpen) lenis.stop();
    else lenis.start();
  }, [isMenuOpen, lenis]);

  // ========== LOCK BODY SCROLL ==========
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ========== ANIMASI BUKA/TUTUP OVERLAY (BUBBLE SCALE) ==========
  useEffect(() => {
    const overlay = menuOverlayRef.current;
    const bubble = bubbleRef.current;
    if (!overlay || !bubble) return;

    // Kill timeline sebelumnya dengan aman
    if (menuTimelineRef.current) {
      menuTimelineRef.current.kill();
      menuTimelineRef.current = null;
    }

    const itemWrappers = menuItemRefs.current.filter(
      (el): el is HTMLDivElement => !!el
    );
    const itemInners = itemWrappers
      .map(
        (wrap) => wrap.querySelector(".menu-link-inner") as HTMLElement | null
      )
      .filter((el): el is HTMLElement => !!el);

    if (isMenuOpen) {
      // Set overlay visible immediately - no delay
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: "auto",
      });

      const tl = gsap.timeline({
        defaults: { force3D: true },
      });
      menuTimelineRef.current = tl;

      // Bubble scale animation
      tl.fromTo(
        bubble,
        {
          scale: 0.2,
        },
        {
          scale: 1.08,
          duration: 1.8,
          ease: "power3.out",
        }
      ).fromTo(
        itemInners,
        {
          y: 32,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=1.4"
      );
    } else {
      const tl = gsap.timeline({
        defaults: { force3D: true },
        onComplete: () => {
          gsap.set(overlay, {
            autoAlpha: 0,
            pointerEvents: "none",
          });
        },
      });

      menuTimelineRef.current = tl;

      const reversed = [...itemInners].reverse();

      tl.to(reversed, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power2.inOut",
      }).to(
        bubble,
        {
          scale: 0.2,
          duration: 1.6,
          ease: "power3.inOut",
        },
        "-=1.0"
      );
    }
  }, [isMenuOpen]);

  // ========== TOGGLE MENU FUNCTION ==========
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const nextState = !prev;
      // Animate icon immediately on state change
      animateHamburgerIcon(nextState);
      return nextState;
    });
  }, [animateHamburgerIcon]);

  const handleMenuItemHover = useCallback(
    (index: number, entering: boolean) => {
      const arrow = menuArrowRefs.current[index];
      if (!arrow) return;

      gsap.to(arrow, {
        rotate: entering ? 90 : 0,
        x: entering ? 4 : 0,
        y: entering ? 4 : 0,
        duration: 0.4,
        ease: "expo.out",
        force3D: true,
      });
    },
    []
  );

  // ========== CLEANUP ==========
  useEffect(() => {
    return () => {
      if (entranceTimelineRef.current) {
        entranceTimelineRef.current.kill();
        entranceTimelineRef.current = null;
      }

      animationRefs.current.forEach((_, element) => {
        cleanupAnimation(element);
      });
      animationRefs.current.clear();

      debounceTimers.current.forEach((timer) => {
        clearTimeout(timer);
      });
      debounceTimers.current.clear();

      if (menuTimelineRef.current) {
        menuTimelineRef.current.kill();
        menuTimelineRef.current = null;
      }

      // Cleanup hamburger animations
      if (hamburgerTopRef.current) gsap.killTweensOf(hamburgerTopRef.current);
      if (hamburgerMiddleRef.current)
        gsap.killTweensOf(hamburgerMiddleRef.current);
      if (hamburgerBottomRef.current)
        gsap.killTweensOf(hamburgerBottomRef.current);
    };
  }, [cleanupAnimation]);

  // ========== OVERLAY PORTAL ==========
  const overlayNode =
    typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuOverlayRef}
            id="mobile-menu-overlay"
            className="fixed inset-0 z-[9997] h-[100dvh] w-full md:hidden overflow-hidden overscroll-none"
          >
            {/* bubble circle yang di-scale dari pojok kanan atas */}
            <div
              ref={bubbleRef}
              className="absolute -top-[60vmax] -right-[60vmax] w-[200vmax] h-[200vmax] rounded-full bg-background2"
            />

            {/* konten menu */}
            <div className="relative z-10 flex h-full w-full flex-col text-white">
              {/* links center - NO SEPARATE CLOSE BUTTON */}
              <div className="flex-1 flex items-center justify-center px-5 pt-16">
                <div className="w-full max-w-xs space-y-3">
                  {navItems.map((item, index) => (
                    <div
                      key={item.path}
                      ref={setMenuItemRef(index)}
                      className="overflow-hidden"
                    >
                      <Link
                        to={item.path}
                        onClick={toggleMenu}
                        onMouseEnter={() => handleMenuItemHover(index, true)}
                        onMouseLeave={() => handleMenuItemHover(index, false)}
                        className="menu-link-inner flex items-center justify-between text-white tracking-[0.18em] uppercase"
                      >
                        <span className="font-centsbook text-[clamp(1.1rem,2.7vw,1.4rem)] leading-none transition-transform duration-300 ease-out hover:translate-x-1">
                          {item.label}
                        </span>
                        <span
                          ref={setMenuArrowRef(index)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35"
                        >
                          <ArrowTopRightIcon className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // ========== MAIN NAVBAR ==========
  return (
    <>
      <nav
        ref={navRef}
        className={`sticky top-0 left-0 right-0 z-[9999] font-centsbook transition-colors duration-300 ease-out ${
          isMenuOpen ? "bg-background2/95 backdrop-blur-lg" : "bg-transparent"
        }`}
        onMouseLeave={handleNavbarMouseLeave}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          isolation: "isolate",
        }}
      >
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="relative flex items-center h-10 md:h-11 lg:h-12">
            {/* Logo */}
            <div className="absolute left-0 flex items-center">
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

            {/* Identity center */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="nav-identity text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase text-gray-300 whitespace-nowrap">
                TITO ZAKI SAPUTRO
              </span>
            </div>

            {/* Right side */}
            <div className="absolute right-0 flex items-center space-x-3">
              {/* 
                HAMBURGER/CLOSE BUTTON - SINGLE SOURCE OF TRUTH
                - Posisi dan ukuran tetap sama
                - Icon morph dengan GSAP
                - Aksesibilitas lengkap
              */}
              <button
                type="button"
                className="relative flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 hover:border-white/70 transition-colors duration-300 z-[10000]"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu-overlay"
                style={{
                  isolation: "isolate",
                }}
              >
                <span className="sr-only">
                  {isMenuOpen ? "Close navigation" : "Open navigation"}
                </span>

                {/* Top line */}
                <span
                  ref={hamburgerTopRef}
                  className="line-top absolute h-[1.5px] w-5 bg-white"
                  style={{
                    transformOrigin: "center center",
                    willChange: "transform",
                  }}
                />

                {/* Middle line */}
                <span
                  ref={hamburgerMiddleRef}
                  className="line-middle absolute h-[1.5px] w-5 bg-white"
                  style={{
                    transformOrigin: "center center",
                    willChange: "transform, opacity",
                  }}
                />

                {/* Bottom line */}
                <span
                  ref={hamburgerBottomRef}
                  className="line-bottom absolute h-[1.5px] w-5 bg-white"
                  style={{
                    transformOrigin: "center center",
                    willChange: "transform",
                  }}
                />
              </button>

              {/* Desktop nav */}
              <ul className="hidden md:flex items-center space-x-4 lg:space-x-6">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onMouseEnter={handleNavHover}
                      onMouseLeave={handleNavLeave}
                      className="nav-link group relative text-sm md:text-base font-normal tracking-wide uppercase whitespace-nowrap transition-colors duration-200 ease-out overflow-hidden block pointer-events-auto text-white"
                      style={{
                        textRendering: "optimizeLegibility",
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <span className="original-text block">{item.label}</span>
                      <span className="duplicate-text absolute top-0 left-0 opacity-0">
                        {item.label}
                      </span>
                      <span className="absolute bottom-0 left-0 h-0.5 bg-white w-0 transition-all duration-300 ease-out group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {overlayNode}
    </>
  );
};

export default Navbar;
