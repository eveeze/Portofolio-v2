import { memo, useState, useCallback } from "react";

interface TechStackCardProps {
  stack: {
    name: string;
    icon: string;
    category: string;
  };
}

// Ultra-optimized TechStackCard dengan minimal re-renders
const TechStackCard = memo<TechStackCardProps>(({ stack }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-md backdrop-blur-sm bg-transparent"
      style={{
        transform: "translate3d(0,0,0)", // Force GPU layer
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      {!imageError && (
        <img
          src={stack.icon}
          alt={stack.name}
          className="w-6 h-6"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
            opacity: imageLoaded ? 1 : 0,
            transition: imageLoaded ? "none" : "opacity 0.2s ease-out",
          }}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      <span
        className="text-whiteText text-sm font-medium font-centsbook whitespace-nowrap"
        style={{
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
        }}
      >
        {stack.name}
      </span>
    </div>
  );
});

TechStackCard.displayName = "TechStackCard";

export default TechStackCard;
