import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import TechStackCard from "../../ui/TechStackCard";
import { techStackData } from "./techStackData";

// Helper function dari GSAP (Tidak ada perubahan di sini, sudah cukup baik)
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
  items = gsap.utils.toArray(items) as HTMLElement[];
  config = config || {};
  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: "none" },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  });

  // Tambahkan guard clause jika tidak ada item untuk mencegah error
  if (items.length === 0) {
    return tl;
  }

  const length = items.length;
  const startX = items[0].offsetLeft;
  const times: number[] = [];
  const widths: number[] = [];
  const xPercents: number[] = [];
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = gsap.utils.snap(config.paddingRight || 0);
  let totalWidth: number,
    curX: number,
    distanceToStart: number,
    distanceToLoop: number,
    item: HTMLElement,
    i: number;

  gsap.set(items, {
    xPercent: (i, el) => {
      const w = (widths[i] = parseFloat(
        gsap.getProperty(el, "width", "px") as string
      ));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px") as string) / w) * 100 +
          (gsap.getProperty(el, "xPercent") as number)
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });

  const lastItem = items[length - 1] as HTMLElement;
  totalWidth =
    lastItem.offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    lastItem.offsetWidth * (gsap.getProperty(lastItem, "scaleX") as number) +
    (config.paddingRight || 0);

  for (i = 0; i < length; i++) {
    item = items[i] as HTMLElement;
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop =
      distanceToStart +
      widths[i] * (gsap.getProperty(item, "scaleX") as number);

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

  if (config.reversed) {
    tl.seek(tl.duration()).timeScale(-1);
  }

  return tl;
}

const TechStack = () => {
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const leftTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const rightTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const techStack = techStackData;
  const reversedTechStack = [...techStackData].reverse();

  useLayoutEffect(() => {
    // =================================================================
    // PERBAIKAN UTAMA DI SINI
    // Kita tunda eksekusi GSAP untuk memastikan layout sudah stabil.
    // =================================================================
    const timeoutId = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (marqueeContainerRef.current) {
          const marqueeLeftItems = gsap.utils.toArray(
            ".marquee-item-left"
          ) as HTMLElement[];
          const marqueeRightItems = gsap.utils.toArray(
            ".marquee-item-right"
          ) as HTMLElement[];

          // Inisialisasi timeline hanya jika elemen ditemukan
          if (marqueeLeftItems.length > 0) {
            leftTimelineRef.current = horizontalLoop(marqueeLeftItems, {
              repeat: -1,
              speed: 0.3,
              paddingRight: 16, // `gap-4` pada parent adalah 1rem = 16px
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
        }
      }, marqueeContainerRef);

      // Pastikan untuk membersihkan context GSAP saat komponen unmount
      return () => ctx.revert();
    }, 100); // Penundaan 100ms biasanya cukup aman.

    // Cleanup function untuk timeout jika komponen unmount sebelum timeout selesai
    return () => clearTimeout(timeoutId);
  }, []);

  const handleMouseEnter = (
    timelineRef: React.MutableRefObject<gsap.core.Timeline | null>
  ) => {
    if (!timelineRef.current) return;
    // Saat `reversed` timeline (timeScale < 0) di-hover, kita perlambat ke -0.2
    const targetTimeScale = timelineRef.current.timeScale() < 0 ? -0.2 : 0.2;
    gsap.to(timelineRef.current, { timeScale: targetTimeScale, duration: 0.5 });
  };

  // =================================================================
  // PERBAIKAN LOGIKA `handleMouseLeave`
  // =================================================================
  const handleMouseLeave = (
    timelineRef: React.MutableRefObject<gsap.core.Timeline | null>
  ) => {
    if (!timelineRef.current) return;
    // Kembalikan ke kecepatan normal (-1 untuk reversed, 1 untuk normal)
    // Mengecek `timeScale()` lebih andal daripada `reversed()`
    const originalTimeScale = timelineRef.current.timeScale() < 0 ? -1 : 1;
    gsap.to(timelineRef.current, {
      timeScale: originalTimeScale,
      duration: 0.5,
    });
  };

  return (
    <div ref={marqueeContainerRef} className="flex flex-col gap-2 mt-2">
      <h1 className="text-lg text-whiteText font-bold font-centsbook">
        Tech Stack
      </h1>
      <hr className="w-full bg-grayText h-[1.5px]" />

      {/* Marquee Kiri */}
      <div
        className="w-full relative overflow-hidden whitespace-nowrap h-10 cursor-pointer"
        onMouseEnter={() => handleMouseEnter(leftTimelineRef)}
        onMouseLeave={() => handleMouseLeave(leftTimelineRef)}
      >
        <div className="flex gap-4 absolute">
          {[...techStack, ...techStack].map((tech, index) => (
            <div
              className="marquee-item-left"
              key={`left-${tech.name}-${index}`}
            >
              <TechStackCard stack={tech} />
            </div>
          ))}
        </div>
      </div>

      <hr className="w-full bg-grayText h-[1.5px]" />

      {/* Marquee Kanan */}
      <div
        className="w-full relative overflow-hidden whitespace-nowrap h-10 cursor-pointer"
        onMouseEnter={() => handleMouseEnter(rightTimelineRef)}
        onMouseLeave={() => handleMouseLeave(rightTimelineRef)}
      >
        <div className="flex gap-4 absolute">
          {[...reversedTechStack, ...reversedTechStack].map((tech, index) => (
            <div
              className="marquee-item-right"
              key={`right-${tech.name}-${index}`}
            >
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
