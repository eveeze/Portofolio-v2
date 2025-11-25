import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import type { Project } from "../../../lib/types/project";

interface ProjectCardProps {
  project: Project;
  index?: number;
  disableAnimation?: boolean;
}

// helper: potong deskripsi kalau kepanjangan
const truncate = (text: string, maxLength: number) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
};

const ProjectCard = ({
  project,
  index = 0,
  disableAnimation = false,
}: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const slideshowShellRef = useRef<HTMLDivElement>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // debounce hover / unhover
  const hoverEnterTimeout = useRef<number | null>(null);
  const hoverLeaveTimeout = useRef<number | null>(null);

  // === MOUNT ANIMATION (card fade in) ===
  useLayoutEffect(() => {
    if (!cardRef.current || disableAnimation) return;

    const enterDelay = Math.min(index * 0.05, 0.25);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 18 },
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

  // === HOVER TIMELINE (GSAP) ===
  useLayoutEffect(() => {
    if (disableAnimation || !cardRef.current) return;

    const ctx = gsap.context(() => {
      const overlay = overlayRef.current;
      const year = yearRef.current;
      const meta = metaRef.current;
      const shell = slideshowShellRef.current;

      if (!overlay || !year || !meta || !shell) return;

      gsap.set(overlay, { autoAlpha: 0, y: 10 });
      gsap.set(year, { autoAlpha: 0, y: -24 });
      gsap.set(shell, {
        autoAlpha: 0,
        scale: 0.8,
        transformOrigin: "50% 50%",
      });
      gsap.set(meta, { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      tl.to(overlay, { autoAlpha: 1, y: 0, duration: 0.75 }, 0)
        .to(year, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.08)
        .to(shell, { autoAlpha: 1, scale: 1, duration: 0.85 }, 0.12)
        .to(meta, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.18);

      tlRef.current = tl;
    }, cardRef);

    return () => {
      ctx.revert();
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [disableAnimation]);

  const clearHoverTimeouts = () => {
    if (hoverEnterTimeout.current !== null) {
      window.clearTimeout(hoverEnterTimeout.current);
      hoverEnterTimeout.current = null;
    }
    if (hoverLeaveTimeout.current !== null) {
      window.clearTimeout(hoverLeaveTimeout.current);
      hoverLeaveTimeout.current = null;
    }
  };

  const handleEnter = () => {
    clearHoverTimeouts();
    hoverEnterTimeout.current = window.setTimeout(() => {
      setIsHovered(true);
      tlRef.current?.timeScale(1).play();
    }, 80);
  };

  const handleLeave = () => {
    clearHoverTimeouts();
    hoverLeaveTimeout.current = window.setTimeout(() => {
      setIsHovered(false);
      tlRef.current?.timeScale(1).reverse();
    }, 90);
  };

  useEffect(
    () => () => {
      clearHoverTimeouts();
    },
    []
  );

  // === IMAGE SLIDESHOW ===
  useEffect(() => {
    if (!project.images || project.images.length <= 1 || !isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
    }, 180); // sedikit lebih pelan, masih rasa "cekrek"

    return () => clearInterval(interval);
  }, [project.images, isHovered]);

  const hasImages = project.images && project.images.length > 0;
  const slideshowImage = hasImages
    ? project.images[currentImageIndex].imageUrl
    : project.thumbnailUrl;

  return (
    <div
      ref={cardRef}
      className="relative w-full group"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* IMAGE WRAPPER – square */}
      <div
        className="
          relative w-full aspect-square overflow-hidden
          shadow-[0_18px_60px_rgba(0,0,0,0.55)]
        "
      >
        {/* Background Image — blur + grayscale saat hover */}
        <div
          className="
            w-full h-full transform-gpu will-change-transform
            transition-all duration-800 ease-[cubic-bezier(0.19,1,0.22,1)]
            group-hover:scale-[1.08]
            group-hover:brightness-[0.5]
            group-hover:blur-[20px]
            group-hover:grayscale
          "
          style={{
            backgroundImage: `url(${project.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Thin dark overlay */}
        <div
          className="
            absolute inset-0 bg-black/35
            opacity-0 group-hover:opacity-100
            transition-opacity duration-800 ease-[cubic-bezier(0.19,1,0.22,1)]
          "
        />

        {/* Hover Overlay Content – GSAP control */}
        <div
          ref={overlayRef}
          className="
            pointer-events-none absolute inset-0
            flex flex-col items-center justify-center
            px-5 md:px-8
          "
        >
          {/* TOP: Project type (label kecil) */}
          <div
            ref={yearRef}
            className="
              text-center
              text-xs md:text-sm font-centsbook tracking-[0.25em]
              text-whiteText/80 uppercase
              mb-4
            "
          >
            {project.projectType.toUpperCase()}
          </div>

          {/* MIDDLE: Slideshow – kartu fokus berwarna di tengah */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div
              ref={slideshowShellRef}
              className="
                relative w-[90%] md:w-[80%]
                aspect-video overflow-hidden
                rounded-[20px]
                bg-background2/40
                shadow-[0_20px_45px_rgba(0,0,0,0.8)]
                will-change-transform
              "
            >
              <div
                key={currentImageIndex}
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${slideshowImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>

          {/* BOTTOM: Title besar + deskripsi pendek */}
          <div ref={metaRef} className="text-center mt-5 max-w-xl mx-auto">
            {/* Title – hero utama */}
            <h3 className="font-oggs text-xl md:text-2xl text-whiteText leading-snug mb-2">
              {project.title}
            </h3>

            {/* Deskripsi dipotong */}
            <p className="text-xs md:text-sm text-grayText font-centsbook">
              {truncate(project.description, 110)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
