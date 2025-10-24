// src/components/fragments/HeaderWeb.tsx (Optimized Implementation)
import AnimatedTextHeader from "../../ui/AnimatedHeader";

const HeaderWeb = () => {
  return (
    <div className="mb-12 w-full h-full">
      <div className="space-y-0">
        {/* First line - WEBSITE */}
        <AnimatedTextHeader
          text="WEBSITE"
          location="start"
          animationDuration={1.2}
          stagger={0.06} // Lebih lambat per huruf
          scrollStart="top bottom-=150px"
          scrollEnd="bottom top+=50px"
          delay={0}
        />

        {/* Second line - & APPS */}
        <AnimatedTextHeader
          text="& APPS"
          location="start"
          animationDuration={1.3}
          stagger={0.08}
          scrollStart="top bottom-=120px"
          scrollEnd="bottom top+=50px"
          delay={200}
        />

        {/* Third line - DEVELOPER */}
        <AnimatedTextHeader
          text="DEVELOPER"
          location="start"
          animationDuration={1.4}
          stagger={0.05}
          scrollStart="top bottom-=90px"
          scrollEnd="bottom top+=50px"
          delay={400} // Delay lebih lama untuk sequential effect
        />
      </div>
    </div>
  );
};

export default HeaderWeb;
