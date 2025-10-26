// components/work/ProjectCard.tsx - Optimized with Ultra Smooth Title Animation
import { useEffect, useRef, useState } from "react";
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

  const [, setIsHovered] = useState(false);
  const animationContextRef = useRef<gsap.Context | null>(null);

  // Only animate on mount if not disabled
  useEffect(() => {
    if (disableAnimation || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
      });
    }, cardRef);

    animationContextRef.current = ctx;

    return () => {
      if (animationContextRef.current) {
        animationContextRef.current.revert();
      }
    };
  }, []);

  // Handle mouse enter - ULTRA SMOOTH hover effect
  const handleMouseEnter = () => {
    setIsHovered(true);

    if (!imageRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      // Create timeline for synchronized animations
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
      });

      // Image scale - smooth and subtle
      tl.to(
        imageRef.current,
        {
          scale: 1.08,
          duration: 0.6,
        },
        0
      );

      // Title top - slide up and fade out (SMOOTH)
      if (titleTopRef.current) {
        tl.to(
          titleTopRef.current,
          {
            y: -30,
            opacity: 0,
            duration: 0.4,
          },
          0
        );
      }

      // Title bottom - slide up from below (SMOOTH)
      if (titleBottomRef.current) {
        tl.fromTo(
          titleBottomRef.current,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
          },
          0.1 // Slight delay for smooth transition
        );
      }

      // Cursor button - smooth scale in
      if (cursorRef.current) {
        tl.to(
          cursorRef.current,
          {
            scale: 1,
            opacity: 1,
            duration: 0.3,
          },
          0.15
        );
      }
    }, cardRef);

    return () => ctx.revert();
  };

  // Handle mouse leave - ULTRA SMOOTH reverse animation
  const handleMouseLeave = () => {
    setIsHovered(false);

    if (!imageRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      // Create timeline for synchronized reverse animations
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
      });

      // Reset image - smooth scale back
      tl.to(
        imageRef.current,
        {
          scale: 1,
          duration: 0.6,
        },
        0
      );

      // Hide cursor button first - smooth fade out
      if (cursorRef.current) {
        tl.to(
          cursorRef.current,
          {
            scale: 0.8,
            opacity: 0,
            duration: 0.25,
          },
          0
        );
      }

      // Title bottom - slide down and fade out (SMOOTH)
      if (titleBottomRef.current) {
        tl.to(
          titleBottomRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.4,
          },
          0.1
        );
      }

      // Title top - slide back down and fade in (SMOOTH)
      if (titleTopRef.current) {
        tl.to(
          titleTopRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
          },
          0.15
        );
      }
    }, cardRef);

    return () => ctx.revert();
  };

  // Track cursor position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !cursorRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Smooth cursor follow with GSAP
    gsap.to(cursorRef.current, {
      x: x,
      y: y,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      className="group cursor-none relative transform-gpu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ opacity: disableAnimation ? 0 : 1 }}
    >
      {/* Image Container - Bigger Square Format */}
      <div className="relative w-full aspect-square overflow-hidden bg-background mb-6 rounded-sm">
        <div
          ref={imageRef}
          className="w-full h-full transform-gpu"
          style={{
            backgroundImage: `url(${project.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        />

        {/* Custom Cursor - "View Case" Button - Smaller Size */}
        <div
          ref={cursorRef}
          className="absolute pointer-events-none z-10 cursor-element"
          style={{
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            opacity: 0,
            scale: 0,
          }}
        >
          <div className="px-4 py-2 bg-whiteText rounded-full flex items-center gap-2 shadow-xl">
            <span className="font-centsbook text-background text-xs font-medium whitespace-nowrap">
              View Case
            </span>
            <svg
              width="12"
              height="12"
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

      {/* Content - Title with ULTRA SMOOTH Animation */}
      <div className="space-y-3">
        {/* Title Container with overflow hidden for smooth animation */}
        <div className="relative overflow-hidden h-[2.5rem] md:h-[3rem] lg:h-[3.5rem]">
          {/* Top Title - Default State (White, Bold) */}
          <div
            ref={titleTopRef}
            className="absolute inset-0 flex items-baseline gap-3 flex-wrap transform-gpu"
            style={{ willChange: "transform, opacity" }}
          >
            <h3 className="font-centsbook text-whiteText text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
              {project.title}
            </h3>
            <span className="font-centsbook text-whiteText text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
              -
            </span>
            <span className="font-centsbook text-whiteText text-xl md:text-2xl lg:text-3xl font-bold leading-tight uppercase">
              {project.projectType}
            </span>
          </div>

          {/* Bottom Title - Hover State (Gray, Bold) */}
          <div
            ref={titleBottomRef}
            className="absolute inset-0 flex items-baseline gap-3 flex-wrap transform-gpu"
            style={{
              willChange: "transform, opacity",
              opacity: 0,
              transform: "translateY(30px)",
            }}
          >
            <h3 className="font-centsbook text-grayText text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
              {project.title}
            </h3>
            <span className="font-centsbook text-grayText text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
              -
            </span>
            <span className="font-centsbook text-grayText text-xl md:text-2xl lg:text-3xl font-bold leading-tight uppercase">
              {project.projectType}
            </span>
          </div>
        </div>

        {/* GitHub Link Only */}
        {project.githubUrl && (
          <div className="pt-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-centsbook text-grayText hover:text-whiteText text-sm transition-colors duration-300 cursor-pointer inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
