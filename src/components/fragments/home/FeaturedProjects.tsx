// src/components/fragments/home/FeaturedProjects.tsx (Updated with Split Header)
import AnimatedTextHeader from "../../ui/AnimatedHeader";

const FeaturedProjects = () => {
  return (
    <div className="min-h-dvh ">
      <div className="">
        <div className=" w-full">
          <div className="space-y-0 w-full h-full tracking-tight text-whiteText leading-48">
            <AnimatedTextHeader
              text="HERE'S SOME"
              location="start"
              animationDuration={1.3}
              stagger={0.07}
              scrollStart="top bottom-=50px"
              scrollEnd="bottom top+=100px"
              delay={0}
              fontFamily="font-oggs"
            />

            <AnimatedTextHeader
              text="OF MY WORKS"
              location="start"
              animationDuration={1.5}
              stagger={0.06}
              scrollStart="top bottom"
              scrollEnd="bottom top+=100px"
              delay={300}
              fontFamily="font-oggs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProjects;
