import { useState, useRef, useEffect, useLayoutEffect, memo } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import gsap from "gsap";

interface ProjectType {
  value: "website" | "mobile" | "backend" | "desktop" | "other" | "all";
  label: string;
}

interface ProjectFilterProps {
  activeFilter: "website" | "mobile" | "backend" | "desktop" | "other" | "all";
  onFilterChange: (
    filter: "website" | "mobile" | "backend" | "desktop" | "other" | "all"
  ) => void;
  projectCounts: Record<string, number>;
}

// Memoized filter item untuk mencegah re-render saat scroll
const FilterItem = memo(
  ({
    filter,
    isActive,
    count,
    onSelect,
    itemRef,
  }: {
    filter: ProjectType;
    index: number;
    isActive: boolean;
    count: number;
    onSelect: (value: any) => void;
    itemRef: (el: HTMLButtonElement | null) => void;
  }) => {
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isActive) {
        gsap.to(e.currentTarget, {
          scale: 1.015,
          x: 3,
          duration: 0.45,
          ease: "power2.out",
          force3D: true,
        });
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      gsap.to(e.currentTarget, {
        scale: 1,
        x: 0,
        duration: 0.45,
        ease: "power2.out",
        force3D: true,
      });
    };

    return (
      <button
        ref={itemRef}
        onClick={() => onSelect(filter.value)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-centsbook text-left text-sm md:text-base"
        style={{
          opacity: 0,
          backgroundColor: isActive
            ? "rgba(239, 239, 238, 0.05)"
            : "transparent",
          color: "#efefee",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
          transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          contain: "layout style paint",
          willChange: "transform, opacity",
        }}
      >
        <span className="font-medium">{filter.label}</span>
        <span
          className="text-sm px-2.5 py-0.5 rounded-full font-medium flex-shrink-0"
          style={{
            backgroundColor: isActive
              ? "rgba(239, 239, 238, 0.1)"
              : "rgba(239, 239, 238, 0.06)",
            color: "#efefee",
          }}
        >
          {count}
        </span>
      </button>
    );
  }
);

FilterItem.displayName = "FilterItem";

const ProjectFilter = ({
  activeFilter,
  onFilterChange,
  projectCounts,
}: ProjectFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownBgRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLButtonElement[]>([]);
  const gsapContextRef = useRef<gsap.Context | null>(null);

  const filters: ProjectType[] = [
    { value: "website", label: "WEBSITES" },
    { value: "mobile", label: "MOBILE APPLICATIONS" },
    { value: "backend", label: "BACKEND" },
    { value: "desktop", label: "DESKTOP" },
    { value: "other", label: "OTHER" },
    { value: "all", label: "ALL" },
  ];

  const getCount = (
    filterValue: "website" | "mobile" | "backend" | "desktop" | "other" | "all"
  ): number => {
    if (filterValue === "all") {
      return Object.values(projectCounts).reduce(
        (sum, count) => sum + count,
        0
      );
    }
    return projectCounts[filterValue] || 0;
  };

  const getActiveLabel = () => {
    const filter = filters.find((f) => f.value === activeFilter);
    return filter?.label || "FILTER";
  };

  // Initialize GSAP config once
  useLayoutEffect(() => {
    // Optimize GSAP ticker untuk smooth scrolling
    gsap.ticker.lagSmoothing(500, 33);

    // Create GSAP context untuk cleanup otomatis
    gsapContextRef.current = gsap.context(() => {}, containerRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, []);

  const openDropdown = () => {
    if (
      !dropdownBgRef.current ||
      !itemsContainerRef.current ||
      !buttonRef.current
    )
      return;

    setIsOpen(true);

    // Batch DOM reads untuk menghindari layout thrashing
    const dropdownElement = dropdownBgRef.current;
    const itemsElement = itemsContainerRef.current;
    const buttonElement = buttonRef.current;
    const iconElement = iconRef.current;
    const items = itemsRef.current.filter(Boolean);

    // Single batch untuk semua set operations
    gsap.set(
      [dropdownElement, buttonElement, itemsElement, iconElement, ...items],
      {
        willChange: "transform, opacity",
      }
    );

    gsap.set(dropdownElement, { display: "block" });

    // Ultra-smooth 60fps timeline dengan force3D
    const tl = gsap.timeline({
      defaults: {
        ease: "expo.out",
        force3D: true,
      },
    });

    // Icon rotation - silky smooth
    tl.to(
      iconElement,
      {
        rotation: 45,
        duration: 0.65,
        ease: "power3.inOut",
      },
      0
    );

    // Button color change - butter smooth
    tl.to(
      buttonElement,
      {
        backgroundColor: "#0b0b0d",
        borderColor: "rgba(239, 239, 238, 0.15)",
        color: "#efefee",
        duration: 0.55,
        ease: "power2.inOut",
      },
      0
    );

    // Expand background - Webflow-style smooth expansion
    tl.fromTo(
      dropdownElement,
      {
        scaleY: 0,
        opacity: 0,
        transformOrigin: "top center",
      },
      {
        scaleY: 1,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
      },
      0.08
    );

    // Show items container - premium smooth
    tl.fromTo(
      itemsElement,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      },
      0.3
    );

    // Items cascade - ultra-smooth stagger
    tl.fromTo(
      items,
      {
        opacity: 0,
        y: -10,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: {
          each: 0.05,
          ease: "power2.out",
        },
        ease: "power3.out",
        onComplete: () => {
          // Clear will-change after animation untuk menghemat memory
          gsap.set(
            [
              dropdownElement,
              buttonElement,
              itemsElement,
              iconElement,
              ...items,
            ],
            {
              willChange: "auto",
            }
          );
        },
      },
      0.4
    );
  };

  const closeDropdown = () => {
    if (
      !dropdownBgRef.current ||
      !itemsContainerRef.current ||
      !buttonRef.current
    )
      return;

    const dropdownElement = dropdownBgRef.current;
    const itemsElement = itemsContainerRef.current;
    const buttonElement = buttonRef.current;
    const iconElement = iconRef.current;
    const items = itemsRef.current.filter(Boolean);

    // Batch set will-change before animation
    gsap.set(
      [dropdownElement, buttonElement, itemsElement, iconElement, ...items],
      {
        willChange: "transform, opacity",
      }
    );

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.in",
        force3D: true,
      },
      onComplete: () => {
        setIsOpen(false);
        gsap.set(dropdownElement, { display: "none" });
        // Batch clear will-change
        gsap.set(
          [dropdownElement, buttonElement, itemsElement, iconElement, ...items],
          {
            willChange: "auto",
          }
        );
      },
    });

    // Icon rotation back - smooth
    tl.to(
      iconElement,
      {
        rotation: 0,
        duration: 0.55,
        ease: "power3.inOut",
      },
      0
    );

    // Items fade out - premium smooth
    tl.to(
      items,
      {
        opacity: 0,
        y: -8,
        duration: 0.35,
        stagger: {
          each: 0.03,
          ease: "power2.in",
        },
        ease: "power3.in",
      },
      0
    );

    // Collapse items container
    tl.to(
      itemsElement,
      {
        opacity: 0,
        duration: 0.45,
        ease: "power3.in",
      },
      0.18
    );

    // Button color revert
    tl.to(
      buttonElement,
      {
        backgroundColor: "transparent",
        borderColor: "rgba(239, 239, 238, 0.25)",
        color: "#efefee",
        duration: 0.5,
        ease: "power2.inOut",
      },
      0.22
    );

    // Collapse background
    tl.to(
      dropdownElement,
      {
        scaleY: 0,
        opacity: 0,
        duration: 0.55,
        ease: "power3.in",
        transformOrigin: "top center",
      },
      0.25
    );
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      openDropdown();
    } else {
      closeDropdown();
    }
  };

  const handleFilterSelect = (
    filter: "website" | "mobile" | "backend" | "desktop" | "other" | "all"
  ) => {
    onFilterChange(filter);
    closeDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleButtonHover = (isHovering: boolean) => {
    if (!buttonRef.current || isOpen) return;

    gsap.to(buttonRef.current, {
      scale: isHovering ? 1.015 : 1,
      borderColor: isHovering
        ? "rgba(239, 239, 238, 0.45)"
        : "rgba(239, 239, 238, 0.25)",
      duration: 0.55,
      ease: "power2.out",
      force3D: true,
    });

    gsap.to(iconRef.current, {
      rotation: isHovering ? 90 : 0,
      scale: isHovering ? 1.08 : 1,
      duration: 0.55,
      ease: "power3.out",
      force3D: true,
    });
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        onMouseEnter={() => handleButtonHover(true)}
        onMouseLeave={() => handleButtonHover(false)}
        className="relative z-20 flex items-center justify-between px-6 py-3 font-centsbook text-sm md:text-base border-2 rounded-full transition-none"
        style={{
          backgroundColor: "transparent",
          borderColor: "rgba(239, 239, 238, 0.25)",
          color: "#efefee",
          minWidth: "280px",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
          contain: "layout style paint",
          willChange: "transform, opacity",
        }}
      >
        <span className="font-medium tracking-wide">{getActiveLabel()}</span>
        <PlusIcon
          ref={iconRef}
          width={18}
          height={18}
          className="flex-shrink-0"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </button>

      {/* Dropdown Background - Dark Gray */}
      <div
        ref={dropdownBgRef}
        className="absolute left-0 top-0 rounded-3xl overflow-hidden"
        style={{
          backgroundColor: "#0b0b0d",
          border: "1px solid rgba(239, 239, 238, 0.08)",
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.6)",
          minWidth: "280px",
          padding: "16px",
          transformOrigin: "top center",
          opacity: 0,
          transform: "scaleY(0) translate3d(0, 0, 0)",
          display: "none",
          zIndex: 10,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
          contain: "layout style paint",
        }}
      >
        {/* Invisible button placeholder */}
        <div className="opacity-0 pointer-events-none flex items-center justify-between px-6 py-3 font-centsbook text-sm md:text-base border-2 rounded-full">
          <span className="font-medium tracking-wide">{getActiveLabel()}</span>
          <PlusIcon width={18} height={18} />
        </div>

        {/* Items Container */}
        <div
          ref={itemsContainerRef}
          className="overflow-hidden"
          style={{
            opacity: 0,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            contain: "layout style paint",
          }}
        >
          <div className="pt-3 space-y-1">
            {filters.map((filter, index) => {
              const count = getCount(filter.value);
              const isActive = activeFilter === filter.value;

              return (
                <FilterItem
                  key={filter.value}
                  filter={filter}
                  index={index}
                  isActive={isActive}
                  count={count}
                  onSelect={handleFilterSelect}
                  itemRef={(el) => {
                    if (el) itemsRef.current[index] = el;
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectFilter);
