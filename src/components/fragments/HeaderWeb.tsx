import AnimatedTextHeader from "../ui/AnimatedHeader";
const HeaderWeb = () => {
  return (
    <div className="mt-16 mb-12 space-y-0 w-full h-full tracking-tight text-whiteText leading-48">
      <div className="mt-16 mb-12 space-y-0 w-full h-full">
        <AnimatedTextHeader
          text="WEBSITE"
          location="start"
          animationDuration={1}
          stagger={0.04}
          scrollStart="top bottom"
        />
        <AnimatedTextHeader
          text="& APPS"
          location="start"
          animationDuration={1.2}
          stagger={0.03}
          scrollStart="top bottom+=30%"
        />
        <AnimatedTextHeader
          text="DEVELOPER"
          location="start"
          animationDuration={1.4}
          stagger={0.02}
          scrollStart="top bottom+=50%"
        />
      </div>
    </div>
  );
};

export default HeaderWeb;
