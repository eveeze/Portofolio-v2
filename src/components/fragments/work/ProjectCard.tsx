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

  // === MOUNT ANIMATION (card fade in) ===
  useLayoutEffect(() => {
    if (!cardRef.current || disableAnimation) return;

    const enterDelay = Math.min(index * 0.05, 0.25);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 18,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: enterDelay,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    }, cardRef);

    return () => {
      ctx.revert();
    };
  }, [index, disableAnimation]);

  // === HOVER TIMELINE (image + rounded + title + view case) ===
  useLayoutEffect(() => {
    if (disableAnimation || !cardRef.current) return;

    const ctx = gsap.context(() => {
      const wrapperEl = imageWrapperRef.current;
      const imageEl = imageRef.current;
      const titleTopEl = titleTopRef.current;
      const titleBottomEl = titleBottomRef.current;
      const cursorEl = cursorRef.current;

      if (!wrapperEl || !imageEl || !titleTopEl || !titleBottomEl || !cursorEl)
        return;

      // STATE AWAL
      gsap.set(wrapperEl, {
        borderRadius: 0,
        willChange: "border-radius",
      });

      gsap.set(imageEl, {
        scale: 1,
        willChange: "transform",
      });

      gsap.set(titleTopEl, {
        yPercent: 0,
        autoAlpha: 1,
        willChange: "transform,opacity",
      });

      gsap.set(titleBottomEl, {
        yPercent: 32,
        autoAlpha: 0,
        willChange: "transform,opacity",
      });

      gsap.set(cursorEl, {
        autoAlpha: 0,
        scale: 0.85,
        yPercent: 15,
        x: 0,
        y: 0,
        willChange: "transform,opacity",
      });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      // IMAGE ZOOM — ringan & fluid
      tl.to(
        imageEl,
        {
          scale: 1.045,
          duration: 0.4,
        },
        0
      );

      // WRAPPER ROUNDED — “melt” halus
      tl.to(
        wrapperEl,
        {
          borderRadius: 26,
          duration: 0.46,
          ease: "power4.out",
        },
        0
      );

      // TITLE TOP KELUAR — +5% lebih lambat (0.315)
      tl.to(
        titleTopEl,
        {
          yPercent: -32,
          autoAlpha: 0,
          duration: 0.315,
          ease: "power4.out",
        },
        0
      );

      // TITLE BOTTOM MASUK — +5% lebih lambat juga
      tl.to(
        titleBottomEl,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.315,
          ease: "power4.out",
        },
        0.03
      );

      // VIEW CASE — Webflow-ish: slide up + fade + scale
      tl.fromTo(
        cursorEl,
        {
          autoAlpha: 0,
          scale: 0.85,
          yPercent: 18,
        },
        {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.32,
          ease: "power3.out",
        },
        0.06
      );

      // CURSOR FOLLOW — viscous, smooth (lebih Webflow feel)
      quickX.current = gsap.quickTo(cursorEl, "x", {
        duration: 0.16,
        ease: "power3.out",
      });

      quickY.current = gsap.quickTo(cursorEl, "y", {
        duration: 0.16,
        ease: "power3.out",
      });

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
    if (disableAnimation) return;
    setIsHovered(true);

    if (tlRef.current) {
      tlRef.current.timeScale(1).play();
    }
  }, [disableAnimation]);

  const reverse = useCallback(() => {
    setIsHovered(false);

    if (tlRef.current) {
      tlRef.current.timeScale(1).reverse();
    }
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
      {/* IMAGE WRAPPER — rounded via GSAP */}
      <div
        ref={imageWrapperRef}
        className="
          relative w-full aspect-square overflow-hidden mb-5 
          shadow-[0_12px_42px_rgba(0,0,0,0.35)]
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
