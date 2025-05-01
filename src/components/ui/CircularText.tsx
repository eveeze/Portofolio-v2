import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers";
  className?: string;
  radius?: number;
}

const CircularText: React.FC<CircularTextProps> = ({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
  radius = 100,
}) => {
  const letters = Array.from(text);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Initial animation
    tween.current = gsap.to(textRef.current, {
      rotation: 360,
      duration: spinDuration,
      repeat: -1,
      ease: "linear",
      transformOrigin: "center center",
    });

    return () => {
      if (tween.current) tween.current.kill();
    };
  }, [spinDuration, text]);

  const handleHoverStart = () => {
    if (!tween.current) return;

    switch (onHover) {
      case "slowDown":
        gsap.to(tween.current, { timeScale: 0.5, duration: 0.5 });
        break;
      case "speedUp":
        gsap.to(tween.current, { timeScale: 4, duration: 0.5 });
        break;
      case "pause":
        tween.current.pause();
        break;
      case "goBonkers":
        gsap.to(tween.current, { timeScale: 20, duration: 0.5 });
        gsap.to(containerRef.current, { scale: 0.8, duration: 0.5 });
        break;
      default:
        break;
    }
  };

  const handleHoverEnd = () => {
    if (!tween.current) return;

    if (onHover === "pause") {
      tween.current.play();
    } else {
      gsap.to(tween.current, { timeScale: 1, duration: 0.5 });
      gsap.to(containerRef.current, { scale: 1, duration: 0.5 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full mx-auto cursor-pointer ${className}`}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      <div ref={textRef} className="absolute top-0 left-0 w-full h-full">
        {letters.map((letter, i) => {
          const angle = (i * 360) / letters.length;
          const radian = (angle * Math.PI) / 180;
          const x = radius * Math.cos(radian);
          const y = radius * Math.sin(radian);

          return (
            <span
              key={i}
              className="absolute text-xs font-normal font-centsbook text-whiteText transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CircularText;
