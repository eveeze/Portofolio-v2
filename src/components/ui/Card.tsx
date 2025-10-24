import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisContext } from "../../providers/LenisProvider";

gsap.registerPlugin(ScrollTrigger);

interface ContactData {
  label: string;
  value: string;
  href?: string;
}

interface CardProps {
  sections: {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    borderType?: "top-left" | "bottom-right";
    contactData?: ContactData[];
  }[];
  isVisible?: boolean;
}

// Type definition for border elements
interface BorderElement {
  element: HTMLDivElement;
  prop: "scaleX" | "scaleY";
  value: number;
}

const Card: React.FC<CardProps> = ({ sections }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topBorderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftBorderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightBorderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottomBorderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRefs = useRef<ScrollTrigger[]>([]);
  const animationStates = useRef<boolean[]>(
    new Array(sections.length).fill(false)
  );

  const { isReady } = useLenisContext();

  useEffect(() => {
    if (!isReady || !cardRef.current) return;

    // Clear previous ScrollTriggers
    scrollTriggerRefs.current.forEach((st) => st.kill());
    scrollTriggerRefs.current = [];

    // Reset animation states
    animationStates.current = new Array(sections.length).fill(false);

    // Set global GSAP defaults
    gsap.defaults({
      ease: "none",
      duration: 1,
    });

    // Define animation functions outside the loop to access them globally
    const animateCardIn = (cardIndex: number, delay: number = 0) => {
      if (animationStates.current[cardIndex]) return;
      animationStates.current[cardIndex] = true;

      const titleRef = titleRefs.current[cardIndex];
      const contentRef = contentRefs.current[cardIndex];
      const section = sections[cardIndex];

      if (!titleRef || !contentRef) return;

      const tl = gsap.timeline({ delay });

      // Get border elements for this card
      const borderElements: BorderElement[] = [];
      const topBorderRef = topBorderRefs.current[cardIndex];
      const leftBorderRef = leftBorderRefs.current[cardIndex];
      const rightBorderRef = rightBorderRefs.current[cardIndex];
      const bottomBorderRef = bottomBorderRefs.current[cardIndex];

      // Fix: Proper border animation setup with smoother timing
      if (section.borderType === "top-left" || !section.borderType) {
        if (topBorderRef) {
          borderElements.push({
            element: topBorderRef,
            prop: "scaleX",
            value: 1,
          });
        }
        if (leftBorderRef) {
          borderElements.push({
            element: leftBorderRef,
            prop: "scaleY",
            value: 1,
          });
        }
      } else if (section.borderType === "bottom-right") {
        if (rightBorderRef) {
          borderElements.push({
            element: rightBorderRef,
            prop: "scaleY",
            value: 1,
          });
        }
        if (bottomBorderRef) {
          borderElements.push({
            element: bottomBorderRef,
            prop: "scaleX",
            value: 1,
          });
        }
      }

      // Animate borders first with much smoother and slower timing
      borderElements.forEach((border, borderIndex) => {
        tl.to(
          border.element,
          {
            [border.prop]: border.value,
            duration: 1.4, // Much longer, more fluid border animation
            ease: "power1.inOut", // Smoother ease for more fluid effect
          },
          borderIndex * 0.3 // Better timing between borders
        );
      });

      // Then animate title and main content container together
      tl.to(
        titleRef,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0, // Smoother title animation
          ease: "power2.out",
        },
        0.4 // Start after borders begin
      ).to(
        contentRef,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0, // Smoother content animation
          ease: "power2.out",
        },
        0.5 // Slight overlap with title
      );

      // Add special animation for contact section child elements
      if (section.contactData) {
        const contactItems = contentRef.querySelectorAll(".contact-item");
        if (contactItems.length > 0) {
          gsap.set(contactItems, {
            opacity: 0,
            y: 20,
            scale: 0.98,
          });

          tl.to(
            contactItems,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.2, // Slower stagger timing
            },
            0.8 // Start after main content begins
          );
        }
      }

      // Add animation for about section text blocks
      if (section.title === "ABOUT") {
        const aboutItems = contentRef.querySelectorAll(".about-text-block");
        if (aboutItems.length > 0) {
          gsap.set(aboutItems, {
            opacity: 0,
            y: 15,
            scale: 0.99,
          });

          tl.to(
            aboutItems,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.15,
            },
            0.8
          );
        }
      }

      // Add animation for skills section items
      if (section.title === "SKILLS") {
        const skillItems = contentRef.querySelectorAll(".skill-item");
        if (skillItems.length > 0) {
          gsap.set(skillItems, {
            opacity: 0,
            y: 15,
            scale: 0.99,
          });

          tl.to(
            skillItems,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.1,
            },
            0.8
          );
        }
      }
    };

    // Function to animate card exit (only when scrolling up)
    const animateCardOut = (cardIndex: number, delay: number = 0) => {
      if (!animationStates.current[cardIndex]) return; // Only animate out if it was animated in
      animationStates.current[cardIndex] = false;

      const titleRef = titleRefs.current[cardIndex];
      const contentRef = contentRefs.current[cardIndex];
      const section = sections[cardIndex];

      if (!titleRef || !contentRef) return;

      const exitTl = gsap.timeline({ delay });

      // Get border elements for this card
      const borderElements: BorderElement[] = [];
      const topBorderRef = topBorderRefs.current[cardIndex];
      const leftBorderRef = leftBorderRefs.current[cardIndex];
      const rightBorderRef = rightBorderRefs.current[cardIndex];
      const bottomBorderRef = bottomBorderRefs.current[cardIndex];

      if (section.borderType === "top-left" || !section.borderType) {
        if (topBorderRef) {
          borderElements.push({
            element: topBorderRef,
            prop: "scaleX",
            value: 0,
          });
        }
        if (leftBorderRef) {
          borderElements.push({
            element: leftBorderRef,
            prop: "scaleY",
            value: 0,
          });
        }
      } else if (section.borderType === "bottom-right") {
        if (rightBorderRef) {
          borderElements.push({
            element: rightBorderRef,
            prop: "scaleY",
            value: 0,
          });
        }
        if (bottomBorderRef) {
          borderElements.push({
            element: bottomBorderRef,
            prop: "scaleX",
            value: 0,
          });
        }
      }

      // For contact section, animate contact items out first
      if (section.contactData) {
        const contactItems = contentRef.querySelectorAll(".contact-item");
        if (contactItems.length > 0) {
          exitTl.to(contactItems, {
            opacity: 0,
            y: -20,
            scale: 0.98,
            duration: 0.5,
            ease: "power2.in",
            stagger: 0.1,
          });
        }
      }

      // Animate about text blocks out
      if (section.title === "ABOUT") {
        const aboutItems = contentRef.querySelectorAll(".about-text-block");
        if (aboutItems.length > 0) {
          exitTl.to(
            aboutItems,
            {
              opacity: 0,
              y: -15,
              scale: 0.99,
              duration: 0.5,
              ease: "power2.in",
              stagger: 0.08,
            },
            0
          );
        }
      }

      // Animate skills items out
      if (section.title === "SKILLS") {
        const skillItems = contentRef.querySelectorAll(".skill-item");
        if (skillItems.length > 0) {
          exitTl.to(
            skillItems,
            {
              opacity: 0,
              y: -15,
              scale: 0.99,
              duration: 0.5,
              ease: "power2.in",
              stagger: 0.06,
            },
            0
          );
        }
      }

      // Then animate main content and title out
      exitTl
        .to(
          contentRef,
          {
            opacity: 0,
            y: -30,
            scale: 0.98,
            duration: 0.6,
            ease: "power2.in",
          },
          section.contactData ||
            section.title === "ABOUT" ||
            section.title === "SKILLS"
            ? 0.4
            : 0
        )
        .to(
          titleRef,
          {
            opacity: 0,
            y: -30,
            scale: 0.98,
            duration: 0.5,
            ease: "power2.in",
          },
          "-=0.2"
        );

      // Finally animate borders out with smoother timing
      borderElements.forEach((border, borderIndex) => {
        exitTl.to(
          border.element,
          {
            [border.prop]: border.value,
            duration: 0.8, // Slower exit for borders
            ease: "power1.inOut", // Smoother ease
          },
          `-=${0.3 + borderIndex * 0.15}`
        );
      });
    };

    sections.forEach((section, index) => {
      const titleRef = titleRefs.current[index];
      const contentRef = contentRefs.current[index];
      const topBorderRef = topBorderRefs.current[index];
      const leftBorderRef = leftBorderRefs.current[index];
      const rightBorderRef = rightBorderRefs.current[index];
      const bottomBorderRef = bottomBorderRefs.current[index];

      if (!titleRef || !contentRef) return;

      // Set initial state - all elements hidden
      gsap.set([titleRef, contentRef], {
        opacity: 0,
        y: 30,
        scale: 0.98,
      });

      // Set initial state for contact section child elements
      if (section.contactData) {
        setTimeout(() => {
          const contactItems = contentRef.querySelectorAll(".contact-item");
          if (contactItems.length > 0) {
            gsap.set(contactItems, {
              opacity: 0,
              y: 20,
              scale: 0.98,
            });
          }
        }, 0);
      }

      // Set initial state for about text blocks
      if (section.title === "ABOUT") {
        setTimeout(() => {
          const aboutItems = contentRef.querySelectorAll(".about-text-block");
          if (aboutItems.length > 0) {
            gsap.set(aboutItems, {
              opacity: 0,
              y: 15,
              scale: 0.99,
            });
          }
        }, 0);
      }

      // Set initial state for skills items
      if (section.title === "SKILLS") {
        setTimeout(() => {
          const skillItems = contentRef.querySelectorAll(".skill-item");
          if (skillItems.length > 0) {
            gsap.set(skillItems, {
              opacity: 0,
              y: 15,
              scale: 0.99,
            });
          }
        }, 0);
      }

      // Setup borders with initial states - Fixed implementation with smoother settings
      if (section.borderType === "top-left" || !section.borderType) {
        if (topBorderRef) {
          gsap.set(topBorderRef, {
            scaleX: 0,
            transformOrigin: "left center",
            force3D: true,
          });
        }
        if (leftBorderRef) {
          gsap.set(leftBorderRef, {
            scaleY: 0,
            transformOrigin: "top center",
            force3D: true,
          });
        }
      } else if (section.borderType === "bottom-right") {
        if (rightBorderRef) {
          gsap.set(rightBorderRef, {
            scaleY: 0,
            transformOrigin: "bottom center",
            force3D: true,
          });
        }
        if (bottomBorderRef) {
          gsap.set(bottomBorderRef, {
            scaleX: 0,
            transformOrigin: "right center",
            force3D: true,
          });
        }
      }

      // Create ScrollTrigger for entrance only (cards appear and stay visible)
      const entranceTrigger = ScrollTrigger.create({
        trigger: titleRef,
        start: "top bottom-=10%",
        onEnter: () => {
          // Sequential entrance with smoother timing
          const delay = index * 0.8; // Slower sequence
          animateCardIn(index, delay);
        },
      });

      scrollTriggerRefs.current.push(entranceTrigger);
    });

    // Special ScrollTrigger for exit animations when scrolling up
    const exitTrigger = ScrollTrigger.create({
      trigger: titleRefs.current[0],
      start: "top bottom+=25%",
      onLeaveBack: () => {
        // Sequential exit when scrolling up (reverse order)
        sections.forEach((_, index) => {
          const cardIndex = sections.length - 1 - index;
          const delay = index * 0.4; // Smoother exit timing

          gsap.delayedCall(delay, () => {
            animateCardOut(cardIndex, 0);
          });
        });
      },
      onEnter: () => {
        // When scrolling back down, re-trigger entrance animations
        sections.forEach((_, index) => {
          const delay = index * 0.8;
          animateCardIn(index, delay);
        });
      },
    });

    scrollTriggerRefs.current.push(exitTrigger);

    // Global refresh
    ScrollTrigger.refresh();

    // Cleanup function
    return () => {
      scrollTriggerRefs.current.forEach((st) => st.kill());
      scrollTriggerRefs.current = [];
    };
  }, [isReady, sections.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scrollTriggerRefs.current.forEach((st) => st.kill());
    };
  }, []);

  // Ref callback functions
  const setTitleRef = (index: number) => (el: HTMLDivElement | null) => {
    titleRefs.current[index] = el;
  };

  const setContentRef = (index: number) => (el: HTMLDivElement | null) => {
    contentRefs.current[index] = el;
  };

  const setTopBorderRef = (index: number) => (el: HTMLDivElement | null) => {
    topBorderRefs.current[index] = el;
  };

  const setLeftBorderRef = (index: number) => (el: HTMLDivElement | null) => {
    leftBorderRefs.current[index] = el;
  };

  const setRightBorderRef = (index: number) => (el: HTMLDivElement | null) => {
    rightBorderRefs.current[index] = el;
  };

  const setBottomBorderRef = (index: number) => (el: HTMLDivElement | null) => {
    bottomBorderRefs.current[index] = el;
  };

  // Helper function to render contact information with underline animation
  const renderContactContent = (contactData: ContactData[]) => {
    return (
      <div className="space-y-4">
        <div className="space-y-3 text-[11px] leading-relaxed">
          {contactData.map((contact, index) => (
            <div
              key={index}
              className="contact-item transform"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="text-white/90">
                {contact.label}{" "}
                {contact.href ? (
                  <a
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="highlighted-link relative inline-block text-grayText hover:text-white transition-colors duration-300"
                  >
                    <span className="relative z-10">{contact.value}</span>
                    <span className="highlight-underline absolute bottom-0 left-0 w-full h-[1px] bg-white/80 transform scale-x-0 origin-left transition-transform duration-400 ease-out"></span>
                  </a>
                ) : (
                  <span className="highlighted-text relative inline-block text-grayText hover:text-white transition-colors duration-300">
                    <span className="relative z-10">{contact.value}</span>
                    <span className="highlight-underline absolute bottom-0 left-0 w-full h-[1px] bg-white/60 transform scale-x-0 origin-left transition-transform duration-400 ease-out"></span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render services content with individual animation items
  const renderServicesContent = () => {
    const skillCategories = [
      "FRONT-END & UI DEVELOPMENT",
      "FULL-STACK APPLICATIONS",
      "CROSS-PLATFORM APPS (FLUTTER)",
      "BACKEND & API DEVELOPMENT",
      "UI ANIMATION & INTERACTIONS",
      "E-COMMERCE DEVELOPMENT",
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-3 text-[11px]">
        {skillCategories.map((skill, idx) => (
          <div
            key={idx}
            className="skill-item leading-relaxed transform"
            style={{ willChange: "transform, opacity" }}
          >
            {skill}
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render about content with text blocks
  const renderAboutContent = (content: string) => {
    // Split content into sentences for individual animation
    const sentences = content.match(/[^\.!?]+[\.!?]+/g) || [content];
    const midpoint = Math.ceil(sentences.length / 3);

    const blocks = [
      sentences.slice(0, midpoint).join(" "),
      sentences.slice(midpoint, midpoint * 2).join(" "),
      sentences.slice(midpoint * 2).join(" "),
    ].filter((block) => block.trim());

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="about-text-block transform"
            style={{ willChange: "transform, opacity" }}
          >
            {block}
          </div>
        ))}
      </div>
    );
  };

  // Add hover effects for underline animation
  useEffect(() => {
    const handleMouseEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const highlightUnderline = target.querySelector(
        ".highlight-underline"
      ) as HTMLElement;
      if (highlightUnderline) {
        gsap.to(highlightUnderline, {
          scaleX: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const highlightUnderline = target.querySelector(
        ".highlight-underline"
      ) as HTMLElement;
      if (highlightUnderline) {
        gsap.to(highlightUnderline, {
          scaleX: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    const highlightedElements = cardRef.current?.querySelectorAll(
      ".highlighted-link, .highlighted-text"
    );
    highlightedElements?.forEach((element) => {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      highlightedElements?.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [sections]);

  return (
    <div ref={cardRef} className="w-full font-mono text-white">
      {/* Enhanced Grid Layout for varied card sizes and longer borders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-16 xl:gap-20 w-full">
        {sections.map((section, index) => {
          const borderType = section.borderType || "top-left";
          const hasContactData = !!section.contactData;
          const isServicesSection = section.title === "SKILLS";
          const isAboutSection = section.title === "ABOUT";

          // Define different spans for each card to create varied layouts
          const getColumnSpan = (index: number) => {
            switch (index) {
              case 0:
                return "xl:col-span-8 xl:col-start-1"; // Card 1: Wide left
              case 1:
                return "xl:col-span-9 xl:col-start-4"; // Card 2: Wide right with offset
              case 2:
                return "xl:col-span-10 xl:col-start-1"; // Card 3: Maximum width
              default:
                return "xl:col-span-12";
            }
          };

          return (
            <div
              key={section.id}
              className={`relative w-full ${getColumnSpan(index)}`}
            >
              {/* Title Section */}
              <div
                ref={setTitleRef(index)}
                className={`
                  mb-2 flex gap-4 items-center tracking-wider text-[11px] opacity-0 h-4 transform
                  ${borderType === "bottom-right" ? "justify-end" : ""}
                `}
              >
                <span className="opacity-50">{section.id}</span>
                <span className="opacity-50">({section.subtitle})</span>
                <span>{section.title}</span>
              </div>

              {/* Content Section with Enhanced Border */}
              <div className="relative w-full">
                {/* Border Elements - Fixed positioning with enhanced gradient */}
                {borderType === "top-left" && (
                  <>
                    <div
                      ref={setTopBorderRef(index)}
                      className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white via-white/90 to-white/60 z-10"
                      style={{ willChange: "transform" }}
                    />
                    <div
                      ref={setLeftBorderRef(index)}
                      className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-white via-white/90 to-white/60 z-10"
                      style={{ willChange: "transform" }}
                    />
                  </>
                )}

                {borderType === "bottom-right" && (
                  <>
                    <div
                      ref={setRightBorderRef(index)}
                      className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-white/60 via-white/90 to-white z-10"
                      style={{ willChange: "transform" }}
                    />
                    <div
                      ref={setBottomBorderRef(index)}
                      className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-white via-white/90 to-white/60 z-10"
                      style={{ willChange: "transform" }}
                    />
                  </>
                )}

                {/* Content */}
                <div
                  ref={setContentRef(index)}
                  className={`
                    px-6 lg:px-8 py-6 lg:py-8 transform
                    tracking-wide text-[11px] leading-[1.8] opacity-0 w-full
                    ${borderType === "top-left" ? "border-t border-l" : "border-r border-b"}
                    border-white/20
                    ${hasContactData || isServicesSection || isAboutSection ? "uppercase" : "uppercase"}
                  `}
                  style={{ willChange: "transform, opacity" }}
                >
                  {hasContactData
                    ? renderContactContent(section.contactData!)
                    : isServicesSection
                      ? renderServicesContent()
                      : isAboutSection
                        ? renderAboutContent(section.content)
                        : section.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Card;
