// src/components/ui/FloatingActionButton.tsx
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

interface FloatingActionButtonProps {
  onAddNew: () => void;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddNew,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      // Entrance animation
      gsap.fromTo(
        buttonRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: 1,
          ease: "back.out(1.7)",
        }
      );

      // Floating animation
      gsap.to(buttonRef.current, {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, []);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    if (buttonRef.current && iconRef.current && labelRef.current) {
      const tl = gsap.timeline();

      tl.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      })
        .to(
          iconRef.current,
          {
            rotation: 45,
            duration: 0.3,
            ease: "back.out(1.7)",
          },
          "<"
        )
        .to(
          labelRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        );
    }
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    if (buttonRef.current && iconRef.current && labelRef.current) {
      const tl = gsap.timeline();

      tl.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      })
        .to(
          iconRef.current,
          {
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          labelRef.current,
          {
            opacity: 0,
            x: 10,
            duration: 0.2,
            ease: "power2.in",
          },
          "<"
        );
    }
  };

  const handleClick = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: onAddNew,
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl transition-all duration-300 z-40 flex items-center space-x-3 ${
        isExpanded ? "px-6 py-4" : "p-4"
      } ${className}`}
    >
      <div ref={iconRef} className="flex-shrink-0">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>

      <span
        ref={labelRef}
        className="whitespace-nowrap font-medium opacity-0 transform translate-x-2"
      >
        Add Tech Stack
      </span>
    </button>
  );
};

export default FloatingActionButton;
