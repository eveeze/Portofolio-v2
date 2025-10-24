// src/components/fragments/Location.tsx (Optimized Implementation)
import AnimatedTextHeader from "../../ui/AnimatedHeader";

const Location = () => {
  return (
    <div className="mt-12 mb-0 space-y-0 w-full h-full tracking-tight text-whiteText leading-48">
      {/* First line - BASED IN */}
      <AnimatedTextHeader
        text="BASED IN"
        location="end"
        animationDuration={1.3}
        stagger={0.07}
        scrollStart="top bottom-=50px"
        scrollEnd="bottom top+=100px"
        delay={0}
      />

      {/* Second line - INDONESIA */}
      <AnimatedTextHeader
        text="INDONESIA"
        location="end"
        animationDuration={1.5}
        stagger={0.06}
        scrollStart="top bottom"
        scrollEnd="bottom top+=100px"
        delay={300}
      />
    </div>
  );
};

export default Location;
