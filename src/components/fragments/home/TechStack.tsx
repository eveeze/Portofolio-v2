import { useLayoutEffect, useRef, useMemo } from "react";
import { useQuery } from "convex/react";
import gsap from "gsap";
import TechStackCard from "../../ui/TechStackCard";
import { api } from "../../../../convex/_generated/api";

// Type untuk data dari Convex
interface ConvexTechStack {
  _id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  position: number;
}

// Type untuk component internal
interface TechStackItem {
  name: string;
  icon: string;
  category: string;
}

// Optimized helper function dengan memoization dan performance improvements
function horizontalLoop(
  items: HTMLElement[],
  config: {
    paused?: boolean;
    repeat?: number;
    reversed?: boolean;
    speed?: number;
    paddingRight?: number;
  }
) {
  const elements = gsap.utils.toArray(items) as HTMLElement[];
  const settings = {
    paused: false,
    repeat: -1,
    speed: 1,
    paddingRight: 0,
    ...config,
  };

  // Early return untuk performa
  if (elements.length === 0) {
    return gsap.timeline({ paused: true });
  }

  const tl = gsap.timeline({
    repeat: settings.repeat,
    paused: settings.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  });

  const length = elements.length;
  const startX = elements[0]?.offsetLeft ?? 0;
  const pixelsPerSecond = settings.speed * 100;
  const snap = gsap.utils.snap(settings.paddingRight);

  // Pre-calculate semua nilai untuk menghindari reflow
  const itemData = elements.map((el, i) => {
    const width = parseFloat(gsap.getProperty(el, "width", "px") as string);
    const xPercent = snap(
      (parseFloat(gsap.getProperty(el, "x", "px") as string) / width) * 100 +
        (gsap.getProperty(el, "xPercent") as number)
    );
    return { element: el, width, xPercent, index: i };
  });

  // Batch set untuk performance
  gsap.set(elements, {
    xPercent: (i) => itemData[i].xPercent,
    x: 0,
  });

  const lastItem = itemData[length - 1];
  const totalWidth =
    lastItem.element.offsetLeft +
    (lastItem.xPercent / 100) * lastItem.width -
    startX +
    lastItem.element.offsetWidth *
      (gsap.getProperty(lastItem.element, "scaleX") as number) +
    settings.paddingRight;

  // Batch create animations
  itemData.forEach(({ element, width, xPercent }) => {
    const curX = (xPercent / 100) * width;
    const distanceToStart = element.offsetLeft + curX - startX;
    const distanceToLoop =
      distanceToStart + width * (gsap.getProperty(element, "scaleX") as number);

    tl.to(
      element,
      {
        xPercent: snap(((curX - distanceToLoop) / width) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    ).fromTo(
      element,
      {
        xPercent: snap(((curX - distanceToLoop + totalWidth) / width) * 100),
      },
      {
        xPercent,
        duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond
    );
  });

  if (settings.reversed) {
    tl.seek(tl.duration()).timeScale(-1);
  }

  return tl;
}

const TechStack = () => {
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const leftTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const rightTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isInitialized = useRef(false);

  // Fetch data dari Convex
  const techStacksQuery = useQuery(api.techStack.getTechStacks);

  // Memoize data processing untuk menghindari re-render unnecessary
  const { techStack, reversedTechStack } = useMemo(() => {
    if (!techStacksQuery || techStacksQuery.length === 0) {
      return { techStack: [], reversedTechStack: [] };
    }

    // Transform data dari database ke format yang dibutuhkan component
    const transformedData: TechStackItem[] = techStacksQuery.map(
      (stack: ConvexTechStack) => ({
        name: stack.name,
        icon: stack.imageUrl || "", // imageUrl dari getTechStacks query
        category: stack.category,
      })
    );

    return {
      techStack: transformedData,
      reversedTechStack: [...transformedData].reverse(),
    };
  }, [techStacksQuery]);

  // Optimized animation setup dengan debounce
  useLayoutEffect(() => {
    if (!techStack.length || isInitialized.current) return;

    const timeoutId = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (!marqueeContainerRef.current) return;

        const marqueeLeftItems = gsap.utils.toArray(
          ".marquee-item-left"
        ) as HTMLElement[];
        const marqueeRightItems = gsap.utils.toArray(
          ".marquee-item-right"
        ) as HTMLElement[];

        // Cleanup existing timelines
        leftTimelineRef.current?.kill();
        rightTimelineRef.current?.kill();

        if (marqueeLeftItems.length > 0) {
          leftTimelineRef.current = horizontalLoop(marqueeLeftItems, {
            repeat: -1,
            speed: 0.3,
            paddingRight: 16,
          });
        }

        if (marqueeRightItems.length > 0) {
          rightTimelineRef.current = horizontalLoop(marqueeRightItems, {
            repeat: -1,
            speed: 0.3,
            reversed: true,
            paddingRight: 16,
          });
        }

        isInitialized.current = true;
      }, marqueeContainerRef);

      return () => {
        ctx.revert();
        isInitialized.current = false;
      };
    }, 50); // Reduced timeout untuk responsiveness yang lebih baik

    return () => clearTimeout(timeoutId);
  }, [techStack.length]); // Dependency pada length untuk re-initialize ketika data berubah

  // Optimized mouse handlers dengan throttling
  const handleMouseEnter = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (timelineRef: React.MutableRefObject<gsap.core.Timeline | null>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!timelineRef.current) return;
        const targetTimeScale =
          timelineRef.current.timeScale() < 0 ? -0.2 : 0.2;
        gsap.to(timelineRef.current, {
          timeScale: targetTimeScale,
          duration: 0.3, // Slightly faster transition
          ease: "power2.out",
        });
      }, 10); // Small delay to prevent excessive calls
    };
  }, []);

  const handleMouseLeave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (timelineRef: React.MutableRefObject<gsap.core.Timeline | null>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!timelineRef.current) return;
        const originalTimeScale = timelineRef.current.timeScale() < 0 ? -1 : 1;
        gsap.to(timelineRef.current, {
          timeScale: originalTimeScale,
          duration: 0.3,
          ease: "power2.out",
        });
      }, 10);
    };
  }, []);

  // Loading state
  if (!techStacksQuery) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <h1 className="text-lg text-whiteText font-bold font-centsbook">
          Tech Stack
        </h1>
        <div className="w-full h-10 flex items-center justify-center">
          <div className="text-grayText text-sm font-centsbook">
            Loading tech stack...
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (techStack.length === 0) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <h1 className="text-lg text-whiteText font-bold font-centsbook">
          Tech Stack
        </h1>
        <div className="w-full h-10 flex items-center justify-center">
          <div className="text-grayText text-sm font-centsbook">
            No tech stack available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={marqueeContainerRef} className="flex flex-col gap-2 mt-2">
      {/* Marquee Kiri */}
      <div
        className="w-full relative overflow-hidden whitespace-nowrap h-10 cursor-pointer transform-gpu"
        onMouseEnter={() => handleMouseEnter(leftTimelineRef)}
        onMouseLeave={() => handleMouseLeave(leftTimelineRef)}
      >
        <div className="flex gap-4 absolute will-change-transform">
          {[...techStack, ...techStack].map((tech, index) => (
            <div
              className="marquee-item-left transform-gpu"
              key={`left-${tech.name}-${index}`}
            >
              <TechStackCard stack={tech} />
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Kanan */}
      <div
        className="w-full relative overflow-hidden whitespace-nowrap h-10 cursor-pointer transform-gpu"
        onMouseEnter={() => handleMouseEnter(rightTimelineRef)}
        onMouseLeave={() => handleMouseLeave(rightTimelineRef)}
      >
        <div className="flex gap-4 absolute will-change-transform">
          {[...reversedTechStack, ...reversedTechStack].map((tech, index) => (
            <div
              className="marquee-item-right transform-gpu"
              key={`right-${tech.name}-${index}`}
            >
              <TechStackCard stack={tech} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
