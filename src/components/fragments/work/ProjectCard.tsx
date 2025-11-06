// components/fragments/work/ProjectCard.tsx — Optimized for 2 Column Grid
import { useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import type { Project } from "../../../lib/types/project";

interface ProjectCardProps {
  project: Project;
  index?: number;
  disableAnimation?: boolean;
}

const ProjectCard = ({
  project,
  index = 0,
  disableAnimation = false,
}: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const titleTopRef = useRef<HTMLDivElement>(null);
  const titleBottomRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const quickRef = useRef<{
    x: (v: number) => void;
    y: (v: number) => void;
  } | null>(null);

  // Mount animation
  useLayoutEffect(() => {
    if (!cardRef.current || disableAnimation) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        delay: index * 0.08,
        ease: "power3.out",
        force3D: true,
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index, disableAnimation]);

  // Build hover timeline
  useLayoutEffect(() => {
    if (!cardRef.current || disableAnimation) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
      });

      if (imageRef.current) {
        tl.to(imageRef.current, { scale: 1.05, duration: 0.4 }, 0);
      }
      if (titleTopRef.current) {
        tl.to(titleTopRef.current, { y: -10, opacity: 0, duration: 0.25 }, 0);
      }
      if (titleBottomRef.current) {
        tl.fromTo(
          titleBottomRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25 },
          0.05
        );
      }
      if (cursorRef.current) {
        tl.fromTo(
          cursorRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.2 },
          0.08
        );
        quickRef.current = {
          x: gsap.quickTo(cursorRef.current, "x", {
            duration: 0.15,
            ease: "power2.out",
          }),
          y: gsap.quickTo(cursorRef.current, "y", {
            duration: 0.15,
            ease: "power2.out",
          }),
        };
      }

      tlRef.current = tl;
    }, cardRef);

    return () => {
      ctx.revert();
      tlRef.current?.kill();
    };
  }, [disableAnimation]);

  const play = useCallback(() => {
    setIsHovered(true);
    tlRef.current?.play();
  }, []);

  const reverse = useCallback(() => {
    setIsHovered(false);
    tlRef.current?.reverse();
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !quickRef.current || !isHovered) return;
    const r = cardRef.current.getBoundingClientRect();
    quickRef.current.x(e.clientX - r.left);
    quickRef.current.y(e.clientY - r.top);
  };

  return (
    <div
      ref={cardRef}
      className="group relative md:cursor-none w-full"
      onMouseEnter={play}
      onMouseLeave={reverse}
      onMouseMove={handleMove}
    >
      {/* Image - Aspect ratio untuk 2 kolom grid */}
      <div className="relative w-full aspect-[4/3] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] mb-4">
        <div
          ref={imageRef}
          className="w-full h-full transform-gpu"
          style={{
            backgroundImage: `url(${project.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            willChange: "transform",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        />
        {/* View Case cursor */}
        <div
          ref={cursorRef}
          className="absolute pointer-events-none z-10 hidden md:block"
          style={{
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            opacity: 0,
            willChange: "transform,opacity",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="px-6 py-3 bg-whiteText rounded-full flex items-center gap-2 shadow-xl">
            <span className="font-centsbook text-background text-sm font-medium whitespace-nowrap">
              View Case
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className="text-background"
            >
              <path
                d="M3 8H13M13 8L8 3M13 8L8 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Titles - Lebih compact untuk grid */}
      <div
        ref={titleWrapRef}
        className="space-y-1"
        onMouseEnter={play}
        onMouseLeave={reverse}
      >
        <div
          className="relative overflow-hidden"
          style={{ height: "clamp(1.75rem, 4vw, 2.25rem)" }}
        >
          {/* default */}
          <div
            ref={titleTopRef}
            className="absolute inset-0 flex items-baseline gap-2 flex-wrap transform-gpu"
            style={{
              willChange: "transform,opacity",
              backfaceVisibility: "hidden",
            }}
          >
            <h3 className="font-centsbook text-whiteText text-base md:text-lg font-bold leading-tight uppercase tracking-wide">
              {project.title}
            </h3>
            <span className="font-centsbook text-whiteText/50 text-base md:text-lg font-bold leading-tight">
              —
            </span>
            <span className="font-centsbook text-whiteText/80 text-base md:text-lg font-bold leading-tight uppercase tracking-wide">
              {project.projectType}
            </span>
          </div>
          {/* hover state */}
          <div
            ref={titleBottomRef}
            className="absolute inset-0 flex items-baseline gap-2 flex-wrap transform-gpu"
            style={{
              willChange: "transform,opacity",
              opacity: 0,
              transform: "translate3d(0,10px,0)",
              backfaceVisibility: "hidden",
            }}
          >
            <h3 className="font-centsbook text-whiteText text-base md:text-lg font-bold leading-tight uppercase tracking-wide">
              {project.title}
            </h3>
            <span className="font-centsbook text-whiteText/50 text-base md:text-lg font-bold leading-tight">
              —
            </span>
            <span className="font-centsbook text-whiteText/80 text-base md:text-lg font-bold leading-tight uppercase tracking-wide">
              {project.projectType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
