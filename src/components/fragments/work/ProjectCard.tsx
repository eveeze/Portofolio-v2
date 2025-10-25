// components/work/ProjectCard.tsx
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Project } from "../../../lib/types/project";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
      });
    }, cardRef);

    return () => ctx.revert();
  }, [index]);

  useEffect(() => {
    if (!imageRef.current) return;

    if (isHovered) {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 0.6,
        ease: "power2.out",
      });
    } else {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-background mb-4">
        <div
          ref={imageRef}
          className="w-full h-full"
          style={{
            backgroundImage: `url(${project.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay on hover */}
        <div
          className={`
            absolute inset-0 bg-background/80 
            transition-opacity duration-500
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-centsbook text-whiteText text-lg">
              View Project →
            </span>
          </div>
        </div>

        {/* Project Type Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-whiteText/10 backdrop-blur-sm rounded-full">
          <span className="font-centsbook text-whiteText text-xs uppercase tracking-wider">
            {project.projectType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="space-y-2">
        {/* Title */}
        <h3 className="font-ogg text-whiteText text-2xl md:text-3xl group-hover:text-grayText transition-colors duration-300">
          {project.title}
        </h3>

        {/* Description */}
        <p className="font-centsbook text-grayText text-sm md:text-base line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <div
                key={tech._id}
                className="flex items-center gap-2 px-3 py-1 bg-background rounded-full"
              >
                {tech.imageUrl && (
                  <img
                    src={tech.imageUrl}
                    alt={tech.name}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="font-centsbook text-whiteText/80 text-xs">
                  {tech.name}
                </span>
              </div>
            ))}
            {project.techStack.length > 4 && (
              <div className="px-3 py-1 bg-background rounded-full">
                <span className="font-centsbook text-whiteText/60 text-xs">
                  +{project.techStack.length - 4}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4 pt-2">
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-centsbook text-whiteText/60 hover:text-whiteText text-sm transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              Live Site ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-centsbook text-whiteText/60 hover:text-whiteText text-sm transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
