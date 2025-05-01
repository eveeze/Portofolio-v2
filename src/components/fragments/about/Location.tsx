import AnimatedTextHeader from "../../ui/AnimatedHeader";

const Location = () => {
  return (
    <div className="mt-16 mb-0 space-y-0 w-full h-full tracking-tight text-whiteText leading-48">
      <AnimatedTextHeader
        text="BASED IN"
        location="end"
        animationDuration={1}
        stagger={0.04}
        scrollStart="top bottom"
      />
      <AnimatedTextHeader
        text="INDONESIA"
        location="end"
        animationDuration={1.2}
        stagger={0.04}
        scrollStart="top bottom+=10%"
      />{" "}
    </div>
  );
};

export default Location;
