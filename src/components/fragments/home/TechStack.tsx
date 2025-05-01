import { useEffect, useRef } from "react";
import TechStackCard from "../../ui/TechStackCard";
import { techStackData } from "./techStackData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function horizontalLoop(
  items: HTMLElement[] | NodeListOf<Element>,
  config: {
    repeat?: number;
    paused?: boolean;
    speed?: number;
    snap?: boolean | number;
    paddingRight?: number;
    reversed?: boolean;
  } = {}
) {
  items = gsap.utils.toArray(items);
  config = config || {};
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      void tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  });
  const length = items.length;
  const startX = items[0].offsetLeft;
  const times: number[] = [];
  const widths: number[] = [];
  const xPercents: number[] = [];
  let curIndex = 0;
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap =
    config.snap === false
      ? (v: number) => v
      : gsap.utils.snap(typeof config.snap === "number" ? config.snap : 1);
  let totalWidth = 0,
    curX = 0,
    distanceToStart = 0,
    distanceToLoop = 0,
    item: Element,
    i: number;
  gsap.set(items, {
    xPercent: (i, el): number => {
      const w = (widths[i] = parseFloat(
        String(gsap.getProperty(el, "width", "px"))
      ));
      xPercents[i] = snap(
        (parseFloat(String(gsap.getProperty(el, "x", "px"))) / w) * 100 +
          parseFloat(String(gsap.getProperty(el, "xPercent")))
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });
  totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
      parseFloat(String(gsap.getProperty(items[length - 1], "scaleX"))) +
    (parseFloat(String(config.paddingRight)) || 0);
  for (i = 0; i < length; i++) {
    item = items[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = (item as HTMLElement).offsetLeft + curX - startX;
    distanceToLoop =
      distanceToStart + widths[i] * Number(gsap.getProperty(item, "scaleX"));
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
          ),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add("label" + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }
  function toIndex(index: number, vars: any) {
    vars = vars || {};
    Math.abs(index - curIndex) > length / 2 &&
      (index += index > curIndex ? -length : length);
    let newIndex = gsap.utils.wrap(0, length, index),
      time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }
  tl.next = (vars?: gsap.TweenVars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars?: gsap.TweenVars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index: number, vars: gsap.TweenVars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true);
  if (config.reversed) {
    tl.vars?.onReverseComplete?.();
    tl.reverse();
  }
  return tl;
}

function createRightMovingMarquee(container: HTMLElement, speed = 0.3) {
  const items = gsap.utils.toArray(container.querySelectorAll(".marquee-item"));
  const totalWidth = Array.from(items).reduce((total: number, item) => {
    const element = item as HTMLElement;
    const marginRight = getComputedStyle(element).marginRight || "0";
    return total + element.offsetWidth + parseFloat(String(marginRight));
  }, 0);

  // Set initial position (offscreen to the left)
  gsap.set(items, { x: (_i) => -totalWidth });

  // Create the timeline for right movement
  const tl = gsap.timeline({ repeat: -1 });

  // Animate all items to move right
  tl.to(items, {
    x: "+=" + totalWidth * 2, // Move twice the total width to ensure enough movement
    duration: totalWidth / (speed * 30), // Adjust speed
    ease: "none",
    stagger: {
      each: 0,
      repeat: -1,
    },
  });

  return tl;
}

const TechStack = () => {
  const marqueeLeftRef = useRef<HTMLDivElement>(null);
  const marqueeRightRef = useRef<HTMLDivElement>(null);
  const leftTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const rightTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Clear any existing animations to prevent duplicates
    if (leftTimelineRef.current) {
      leftTimelineRef.current.kill();
    }
    if (rightTimelineRef.current) {
      rightTimelineRef.current.kill();
    }

    // Create the left marquee animation (moves to the left)
    if (marqueeLeftRef.current) {
      const marqueeItems = gsap.utils.toArray(
        marqueeLeftRef.current.querySelectorAll(".marquee-item")
      ) as HTMLElement[];

      if (marqueeItems.length > 0) {
        leftTimelineRef.current = horizontalLoop(marqueeItems, {
          speed: 0.3,
          repeat: -1,
          paused: false,
        });
      }
    }

    // Create the right marquee animation using a different approach
    if (marqueeRightRef.current) {
      rightTimelineRef.current = createRightMovingMarquee(
        marqueeRightRef.current,
        0.3
      );
    }

    // Left marquee handlers (pause/play)
    const pauseLeftMarquee = () => {
      if (leftTimelineRef.current) {
        leftTimelineRef.current.pause();
      }
    };

    const playLeftMarquee = () => {
      if (leftTimelineRef.current) {
        leftTimelineRef.current.play();
      }
    };

    // Right marquee handlers (pause/play)
    const pauseRightMarquee = () => {
      if (rightTimelineRef.current) {
        rightTimelineRef.current.pause();
      }
    };

    const playRightMarquee = () => {
      if (rightTimelineRef.current) {
        rightTimelineRef.current.play();
      }
    };

    // Add event listeners
    if (marqueeLeftRef.current) {
      marqueeLeftRef.current.addEventListener("mouseenter", pauseLeftMarquee);
      marqueeLeftRef.current.addEventListener("mouseleave", playLeftMarquee);
    }

    if (marqueeRightRef.current) {
      marqueeRightRef.current.addEventListener("mouseenter", pauseRightMarquee);
      marqueeRightRef.current.addEventListener("mouseleave", playRightMarquee);
    }

    // Cleanup function
    return () => {
      // Remove event listeners
      if (marqueeLeftRef.current) {
        marqueeLeftRef.current.removeEventListener(
          "mouseenter",
          pauseLeftMarquee
        );
        marqueeLeftRef.current.removeEventListener(
          "mouseleave",
          playLeftMarquee
        );
      }

      if (marqueeRightRef.current) {
        marqueeRightRef.current.removeEventListener(
          "mouseenter",
          pauseRightMarquee
        );
        marqueeRightRef.current.removeEventListener(
          "mouseleave",
          playRightMarquee
        );
      }

      // Kill timelines
      if (leftTimelineRef.current) {
        leftTimelineRef.current.kill();
      }
      if (rightTimelineRef.current) {
        rightTimelineRef.current.kill();
      }
    };
  }, []);

  const doubledTechStack = [
    ...techStackData,
    ...techStackData,
    ...techStackData,
    ...techStackData,
  ];

  return (
    <div className="flex flex-col gap-2 mt-2">
      <h1 className="text-lg text-whiteText font-bold font-centsbook">
        Tech Stack
      </h1>

      <hr className="w-full bg-grayText h-[1.5px]" />
      <div
        ref={marqueeLeftRef}
        className="w-full relative overflow-hidden whitespace-nowrap h-10 cursor-pointer"
      >
        <div className="flex gap-4 absolute">
          {doubledTechStack.map((tech, index) => (
            <div className="marquee-item" key={`left-${tech.name}-${index}`}>
              <TechStackCard stack={tech} />
            </div>
          ))}
        </div>
      </div>

      <hr className="w-full bg-grayText h-[1.5px]" />
      <div
        ref={marqueeRightRef}
        className="w-full relative overflow-hidden whitespace-nowrap h-10 cursor-pointer"
      >
        <div className="flex gap-4 absolute">
          {[...doubledTechStack].reverse().map((tech, index) => (
            <div className="marquee-item" key={`right-${tech.name}-${index}`}>
              <TechStackCard stack={tech} />
            </div>
          ))}
        </div>
      </div>
      <hr className="w-full bg-grayText h-[1.5px]" />
    </div>
  );
};

export default TechStack;
