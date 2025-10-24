import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenisContext } from "../../providers/LenisProvider";

gsap.registerPlugin(ScrollTrigger);

interface CardProps {
  sections: {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    borderType?: "top-left" | "bottom-right";
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

  // Add refs for contact content animation
  const contactItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { isReady } = useLenisContext();

  useEffect(() => {
    if (!isReady || !cardRef.current) return;

    // Clear previous ScrollTriggers
    scrollTriggerRefs.current.forEach((st) => st.kill());
    scrollTriggerRefs.current = [];

    // Set global GSAP defaults
    gsap.defaults({
      ease: "none", // Use "none" for scrub animations
      duration: 1,
    });

    sections.forEach((section, index) => {
      const titleRef = titleRefs.current[index];
      const contentRef = contentRefs.current[index];
      const topBorderRef = topBorderRefs.current[index];
      const leftBorderRef = leftBorderRefs.current[index];
      const rightBorderRef = rightBorderRefs.current[index];
      const bottomBorderRef = bottomBorderRefs.current[index];

      if (!titleRef || !contentRef) return;

      const isContactSection = section.title === "REACH OUT";

      // Set initial state - all elements hidden
      gsap.set([titleRef, contentRef], {
        opacity: 0,
        y: 50,
        scale: 0.95,
      });

      // For contact section, also set initial state for individual items
      if (isContactSection) {
        const contactItems = contactItemRefs.current.filter(Boolean);
        gsap.set(contactItems, {
          opacity: 0,
          y: 20,
          scale: 0.95,
        });
      }

      // Setup borders with initial states
      const borderElements: BorderElement[] = [];
      if (section.borderType === "top-left" || !section.borderType) {
        if (topBorderRef) {
          gsap.set(topBorderRef, {
            scaleX: 0,
            transformOrigin: "left center",
          });
          borderElements.push({
            element: topBorderRef,
            prop: "scaleX",
            value: 1,
          });
        }
        if (leftBorderRef) {
          gsap.set(leftBorderRef, {
            scaleY: 0,
            transformOrigin: "top center",
          });
          borderElements.push({
            element: leftBorderRef,
            prop: "scaleY",
            value: 1,
          });
        }
      } else if (section.borderType === "bottom-right") {
        if (rightBorderRef) {
          gsap.set(rightBorderRef, {
            scaleY: 0,
            transformOrigin: "bottom center",
          });
          borderElements.push({
            element: rightBorderRef,
            prop: "scaleY",
            value: 1,
          });
        }
        if (bottomBorderRef) {
          gsap.set(bottomBorderRef, {
            scaleX: 0,
            transformOrigin: "right center",
          });
          borderElements.push({
            element: bottomBorderRef,
            prop: "scaleX",
            value: 1,
          });
        }
      }

      // Create timeline for all animations
      const tl = gsap.timeline();

      // Animate borders first
      borderElements.forEach((border, borderIndex) => {
        tl.to(
          border.element,
          {
            [border.prop]: border.value,
            duration: 0.3,
            ease: "power2.out",
          },
          borderIndex * 0.1
        );
      });

      // Then animate content
      tl.to(
        titleRef,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0.2
      ).to(
        contentRef,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0.3
      );

      // Add contact items animation if it's contact section
      if (isContactSection) {
        const contactItems = contactItemRefs.current.filter(Boolean);
        contactItems.forEach((item, itemIndex) => {
          if (item) {
            tl.to(
              item,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
              },
              0.4 + itemIndex * 0.1 // Stagger each item
            );
          }
        });
      }

      // Create ScrollTrigger with different behavior for different cards
      const isLastCard = index === sections.length - 1;

      const trigger = ScrollTrigger.create({
        trigger: titleRef,
        start: "top bottom-=20%",
        end: isLastCard
          ? "bottom top-=50%" // Last card stays visible longer
          : "bottom top+=10%", // Other cards disappear sooner
        animation: tl,
        scrub: 1, // Smooth scrub animation that follows scroll
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
        refreshPriority: -index, // Last cards get higher priority

        // Custom callbacks for better control
        onUpdate: (self) => {
          // For the last card, prevent it from disappearing at the bottom
          if (isLastCard && self.progress > 0.8) {
            // Keep the last card visible when reaching the bottom
            gsap.to([titleRef, contentRef], {
              opacity: 1,
              duration: 0.1,
              overwrite: true,
            });

            // Also keep contact items visible if it's contact section
            if (isContactSection) {
              const contactItems = contactItemRefs.current.filter(Boolean);
              gsap.to(contactItems, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.1,
                overwrite: true,
              });
            }

            borderElements.forEach((border) => {
              gsap.to(border.element, {
                [border.prop]: border.value,
                duration: 0.1,
                overwrite: true,
              });
            });
          }
        },
      });

      scrollTriggerRefs.current.push(trigger);
    });

    // Add a special ScrollTrigger for the last section to handle bottom behavior
    const lastTitleRef = titleRefs.current[sections.length - 1];
    const lastContentRef = contentRefs.current[sections.length - 1];
    const isLastSectionContact =
      sections[sections.length - 1]?.title === "REACH OUT";

    if (lastTitleRef && lastContentRef) {
      const keepVisibleTrigger = ScrollTrigger.create({
        trigger: lastTitleRef,
        start: "bottom bottom",
        end: "bottom top",
        onEnter: () => {
          // Keep last card visible when reaching bottom
          gsap.to([lastTitleRef, lastContentRef], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });

          // Keep contact items visible if last section is contact
          if (isLastSectionContact) {
            const contactItems = contactItemRefs.current.filter(Boolean);
            gsap.to(contactItems, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        },
        onLeave: () => {
          // Only hide when scrolling up past the trigger
        },
        onEnterBack: () => {
          // Show again when coming back from bottom
          gsap.to([lastTitleRef, lastContentRef], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });

          // Show contact items again if it's contact section
          if (isLastSectionContact) {
            const contactItems = contactItemRefs.current.filter(Boolean);
            gsap.to(contactItems, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        },
      });

      scrollTriggerRefs.current.push(keepVisibleTrigger);
    }

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

  // Contact item ref callback
  const setContactItemRef = (index: number) => (el: HTMLDivElement | null) => {
    contactItemRefs.current[index] = el;
  };

  // Helper function to render contact information with animation refs
  const renderContactContent = (content: string) => {
    // Parse the content to extract individual contact items
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    return (
      <div className="space-y-4">
        <div className="space-y-2 text-[11px] leading-relaxed">
          {lines.map((line, index) => {
            // Check if line contains **text** for bold formatting
            const isBold = line.includes("**");
            const cleanText = line.replace(/\*\*/g, "");

            return (
              <div
                key={index}
                ref={setContactItemRef(index)}
                className="opacity-0 transform"
                style={{ willChange: "transform, opacity" }}
              >
                {isBold ? (
                  <h1 className="font-bold">{cleanText}</h1>
                ) : (
                  cleanText
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to render services content
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
          <div key={idx} className="leading-relaxed">
            {skill}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={cardRef} className="w-full font-mono text-white">
      {/* Enhanced Grid Layout for varied card sizes and longer borders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-16 xl:gap-20 w-full">
        {sections.map((section, index) => {
          const borderType = section.borderType || "top-left";
          const isContactSection = section.title === "REACH OUT";
          const isServicesSection = section.title === "SKILLS";

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
                {/* Border Elements */}
                {borderType === "top-left" && (
                  <>
                    <div
                      ref={setTopBorderRef(index)}
                      className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-white to-white/90"
                      style={{ willChange: "transform" }}
                    />
                    <div
                      ref={setLeftBorderRef(index)}
                      className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white to-white/90"
                      style={{ willChange: "transform" }}
                    />
                  </>
                )}

                {borderType === "bottom-right" && (
                  <>
                    <div
                      ref={setRightBorderRef(index)}
                      className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-t from-white to-white/90"
                      style={{ willChange: "transform" }}
                    />
                    <div
                      ref={setBottomBorderRef(index)}
                      className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-white to-white/90"
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
                    ${borderType === "top-left" ? "border-t-2 border-l-2" : "border-r-2 border-b-2"}
                    border-transparent
                    ${isContactSection || isServicesSection ? "uppercase" : "uppercase"}
                  `}
                  style={{ willChange: "transform, opacity" }}
                >
                  {isContactSection
                    ? renderContactContent(section.content)
                    : isServicesSection
                      ? renderServicesContent()
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
