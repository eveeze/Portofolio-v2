// src/components/fragments/admin/techstack/TechStackCard.tsx
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface TechStackCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  position: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

const TechStackCard: React.FC<TechStackCardProps> = ({
  id,
  name,
  category,
  imageUrl,
  position,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && !isDragging) {
      gsap.fromTo(
        cardRef.current,
        {
          scale: 0.8,
          opacity: 0,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: position * 0.1,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [position, isDragging]);

  const handleMouseEnter = () => {
    if (cardRef.current && imageRef.current && actionsRef.current) {
      const tl = gsap.timeline();
      tl.to(cardRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      })
        .to(
          imageRef.current,
          {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          actionsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            ease: "power2.out",
          },
          "<"
        );
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current && imageRef.current && actionsRef.current) {
      const tl = gsap.timeline();
      tl.to(cardRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
        .to(
          imageRef.current,
          {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          actionsRef.current,
          {
            opacity: 0,
            y: 10,
            duration: 0.2,
            ease: "power2.out",
          },
          "<"
        );
    }
  };

  const handleEdit = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => onEdit(id),
      });
    }
  };

  const handleDelete = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => onDelete(id),
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Frontend: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Backend: "bg-green-500/20 text-green-400 border-green-500/30",
      Database: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      DevOps: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      Mobile: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      Design: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-background border border-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
        isDragging
          ? "shadow-2xl border-blue-500 bg-background/90"
          : "hover:border-gray-700"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", id);
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1.1,
            rotation: 5,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      }}
      onDragEnd={() => {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }}
    >
      {/* Position Badge */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
        {position + 1}
      </div>

      {/* Image Container */}
      <div className="relative w-16 h-16 mx-auto mb-4 overflow-hidden rounded-lg bg-gray-800">
        <img
          ref={imageRef}
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" fill="#374151"/>
                <text x="32" y="36" text-anchor="middle" fill="#9CA3AF" font-size="10">${name.slice(0, 2).toUpperCase()}</text>
              </svg>
            `)}`;
          }}
        />
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-whiteText font-semibold text-lg mb-2 truncate">
          {name}
        </h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(category)}`}
        >
          {category}
        </span>
      </div>

      {/* Action Buttons */}
      <div
        ref={actionsRef}
        className="absolute inset-0 bg-background/95 rounded-xl flex items-center justify-center space-x-3 opacity-0 transform translate-y-2"
      >
        <button
          onClick={handleEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200 transform hover:scale-110"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-all duration-200 transform hover:scale-110"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TechStackCard;
