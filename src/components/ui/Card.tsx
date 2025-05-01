import { useEffect, useRef } from "react";
import gsap from "gsap";

interface CardProps {
  sections: {
    id: string;
    title: string;
    subtitle: string;
    content: string;
  }[];
  isVisible?: boolean;
}

const Card: React.FC<CardProps> = ({ sections, isVisible = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!cardRef.current) return;
    const tl = gsap.timeline({ paused: true });

    // Initial setup for card
    gsap.set(cardRef.current, { opacity: 0, y: 20 });

    // Initial setup for lines
    borderRefs.current.forEach((ref, index) => {
      if (ref && lineContainerRefs.current[index]) {
        gsap.set(ref, {
          scaleX: 0,
          transformOrigin: "left center",
        });
        gsap.set(lineContainerRefs.current[index], {
          opacity: 0.2,
        });
      }
    });

    // Card animation
    tl.to(cardRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    });

    // Line container and line animations
    borderRefs.current.forEach((ref, index) => {
      if (ref && lineContainerRefs.current[index]) {
        tl.to(
          lineContainerRefs.current[index],
          {
            opacity: 0.2,
            duration: 0.1,
          },
          index === 0 ? "-=0.3" : ">",
        ).to(
          ref,
          {
            scaleX: 1,
            duration: 1,
            ease: "power2.inOut",
          },
          "<",
        );
      }
    });

    if (isVisible) {
      tl.play();
    } else {
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [isVisible, sections.length]);

  // Callback functions for refs
  const setBorderRef = (index: number) => (el: HTMLDivElement | null) => {
    borderRefs.current[index] = el;
  };

  const setLineContainerRef =
    (index: number) => (el: HTMLDivElement | null) => {
      lineContainerRefs.current[index] = el;
    };

  return (
    <div ref={cardRef} className="w-full font-mono text-white max-w-[1200px]">
      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, index) => (
          <div key={section.id} className="relative">
            <div className="flex gap-2 items-center mb-8 tracking-wider text-[10px]">
              <span className="opacity-50">{section.id}</span>
              <span className="opacity-50">({section.subtitle})</span>
              <span className="ml-auto">{section.title}</span>
            </div>
            <div className="tracking-wider uppercase whitespace-pre-line text-[11px] leading-[1.8]">
              {section.content}
            </div>
            {index < sections.length - 1 && (
              <div
                ref={setLineContainerRef(index)}
                className="my-8 w-full opacity-0"
              >
                <div
                  ref={setBorderRef(index)}
                  className="w-full bg-white h-[1px]"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card;
