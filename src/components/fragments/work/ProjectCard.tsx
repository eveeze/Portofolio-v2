import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
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
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const titleTopRef = useRef<HTMLDivElement>(null);
  const titleBottomRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  // === MOUNT ANIMATION (card masuk) ===
  useLayoutEffect(() => {
    if (!cardRef.current || disableAnimation) return;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        delay: index * 0.08,
        ease: "power3.out",
      });
    }, cardRef);

    return () => ctx.revert();
  }, [index, disableAnimation]);

  // === HOVER TIMELINE (image + title + view case) ===
  useLayoutEffect(() => {
    if (disableAnimation || !cardRef.current) return;

    const ctx = gsap.context(() => {
      // pastikan state awal title hover
      if (titleBottomRef.current) {
        gsap.set(titleBottomRef.current, {
          opacity: 0,
          y: 14,
        });
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
      });

      // Image zoom — soft & pelan
      tl.to(
        imageRef.current,
        {
          scale: 1.04,
          duration: 0.6,
          ease: "power3.out",
        },
        0
      );

      // Title default keluar
      tl.to(
        titleTopRef.current,
        {
          y: -14,
          opacity: 0,
          duration: 0.45,
        },
        0
      );

      // Title hover masuk
      tl.to(
        titleBottomRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
        },
        0.05
      );

      // View Case pill – kecil, compact, muncul lembut
      tl.fromTo(
        cursorRef.current,
        {
          opacity: 0,
          scaleX: 0,
          scaleY: 0.85,
          transformOrigin: "50% 50%",
        },
        {
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        0.12
      );

      // cursor follow
      if (cursorRef.current) {
        quickX.current = gsap.quickTo(cursorRef.current, "x", {
          duration: 0.25,
          ease: "power2.out",
        });

        quickY.current = gsap.quickTo(cursorRef.current, "y", {
          duration: 0.25,
          ease: "power2.out",
        });
      }

      tlRef.current = tl;
    }, cardRef);

    return () => {
      ctx.revert();
      tlRef.current?.kill();
      tlRef.current = null;
      quickX.current = null;
      quickY.current = null;
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
    if (!isHovered || !cardRef.current) return;

    const r = cardRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    quickX.current?.(x);
    quickY.current?.(y);
  };

  return (
    <div
      ref={cardRef}
      className="group relative md:cursor-none w-full"
      onMouseEnter={play}
      onMouseLeave={reverse}
      onMouseMove={handleMove}
    >
      {/* IMAGE WRAPPER — square default, rounded via CSS on hover (bukan GSAP) */}
      <div
        ref={imageWrapperRef}
        className="
          relative w-full aspect-square overflow-hidden mb-5 
          shadow-[0_12px_42px_rgba(0,0,0,0.35)]
          transition-[border-radius] duration-500 
          ease-[cubic-bezier(0.22,0.61,0.36,1)]
          group-hover:rounded-[26px]
        "
      >
        <div
          ref={imageRef}
          className="w-full h-full transform-gpu"
          style={{
            backgroundImage: `url(${project.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        />
      </div>

      {/* TITLES */}
      <div className="relative overflow-hidden" style={{ height: "2.3rem" }}>
        {/* Normal state */}
        <div
          ref={titleTopRef}
          className="absolute inset-0 flex items-baseline gap-2 font-oggs text-lg font-bold"
        >
          <h3 className="text-whiteText uppercase tracking-wide">
            {project.title}
          </h3>
          <span className="text-whiteText">—</span>
          <span className="text-whiteText uppercase tracking-wide">
            {project.projectType}
          </span>
        </div>

        {/* Hover state */}
        <div
          ref={titleBottomRef}
          className="absolute inset-0 flex items-baseline gap-2 font-oggs text-lg font-bold"
          style={{ opacity: 0, transform: "translateY(14px)" }}
        >
          <h3 className="text-whiteText uppercase tracking-wide">
            {project.title}
          </h3>
          <span className="text-whiteText">—</span>
          <span className="text-whiteText uppercase tracking-wide">
            {project.projectType}
          </span>
        </div>
      </div>

      {/* VIEW CASE cursor – kecil & compact */}
      <div
        ref={cursorRef}
        className="pointer-events-none absolute z-20 hidden md:flex items-center justify-center bg-whiteText text-background rounded-full shadow-lg"
        style={{
          left: 0,
          top: 0,
          opacity: 0,
          transform: "translate(-50%, -50%) scale(0.9)",
          willChange: "transform, opacity",
          padding: "3px 9px",
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        <span className="font-centsbook whitespace-nowrap">View Case</span>
      </div>
    </div>
  );
};

export default ProjectCard;
