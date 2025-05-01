import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TimerIcon, CodeIcon } from "@radix-ui/react-icons";

const UnderDevelopment = () => {
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef(null);
  const paragraph1Ref = useRef(null);
  const paragraph2Ref = useRef(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconContainerRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    // Timeline for initial load animation
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 }
    );

    tl.fromTo(
      titleRef.current,
      { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
      { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.8 },
      "-=0.5"
    );

    tl.fromTo(
      paragraph1Ref.current,
      { opacity: 0 },
      { opacity: 0.8, duration: 0.6 },
      "-=0.4"
    );

    tl.fromTo(
      paragraph2Ref.current,
      { opacity: 0 },
      { opacity: 0.8, duration: 0.6 },
      "-=0.3"
    );

    tl.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5 },
      "-=0.2"
    );

    tl.fromTo(
      iconContainerRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.3"
    );

    // Loading dots animation
    if (dotsRef.current) {
      gsap.to(dotsRef.current.children, {
        opacity: 1,
        stagger: 0.3,
        repeat: -1,
        yoyo: true,
        duration: 0.5,
      });
    }

    // Circle pulse animation
    gsap.to(circleRef.current, {
      scale: 1.05,
      opacity: 0.7,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  // Button hover effect
  useEffect(() => {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      backgroundColor: isHovering
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0)",
      color: isHovering ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.7)",
      duration: 0.3,
    });

    // Move arrow on hover
    gsap.to(buttonRef.current.querySelector(".arrow"), {
      x: isHovering ? 5 : 0,
      duration: 0.3,
    });
  }, [isHovering]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div
        ref={containerRef}
        className="relative flex flex-col items-center justify-center p-12 max-w-md overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="z-10 flex flex-col items-center text-center">
          <h1
            ref={titleRef}
            className="text-4xl font-bold tracking-wider uppercase text-white relative"
          >
            Under Development
          </h1>

          <div ref={dotsRef} className="flex mt-4 space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white opacity-0"
              />
            ))}
          </div>

          <p ref={paragraph1Ref} className="mt-8 text-white/80 text-md">
            We're designing something exceptional
          </p>

          <p ref={paragraph2Ref} className="mt-2 text-white/60 text-sm">
            Our new experience launches soon
          </p>

          <div ref={iconContainerRef} className="flex mt-12 space-x-8">
            <div className="flex flex-col items-center">
              <TimerIcon className="w-6 h-6 text-white/50" />
              <span className="mt-2 text-xs text-white/50">Coming Soon</span>
            </div>
            <div className="flex flex-col items-center">
              <CodeIcon className="w-6 h-6 text-white/50" />
              <span className="mt-2 text-xs text-white/50">In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;
