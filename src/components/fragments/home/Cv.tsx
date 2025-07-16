import HighlightedText from "../../ui/HighlightedText";
import WorkingStatus from "../../ui/WorkingStatus";
import FindMe from "./FindMe";
import TechStack from "./TechStack";
const Cv = () => {
  return (
    <div className=" max-w-3xl mx-auto p-6  gap-8 rounded-2xl mt-16">
      <div className="flex flex-col ">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 ">
            <img
              src="/images/pp.jpg"
              alt="Profile Picture"
              className="w-20 h-20 rounded-full object-cover border border-grayText"
            />
          </div>
          <div className="flex flex-col gap-1">
            <WorkingStatus isEmployed={false} />

            <h2 className="text-whiteText text-xl font-bold font-centsbook mt-0.5">
              Tito Zaki Saputro
            </h2>
            <p className="text-grayText text-sm font-centsbook">
              Fullstack Developer
            </p>
            <p className="text-grayText font-cencschit text-sm mt-2">
              I am a 21-year-old college student at{" "}
              <HighlightedText
                link="https://uty.ac.id/"
                text="Universitas Teknologi Yogyakarta"
              />
              , majoring in Informatics Engineering.
            </p>
            <p className="text-grayText font-cencschit text-sm mt-1">
              I began my programming journey in 2019, but truly immersed myself
              in it when I joined college in 2022. My passion lies in
              conceptualizing innovative ideas and bringing them to life through
              code. Check out my work{" "}
              <HighlightedText link="/project" target="_self" text="here" /> or
              learn more about me{" "}
              <HighlightedText link="/about" target="_self" text="here" />
            </p>
            <p className="text-grayText font-cencschit text-sm mt-1">
              I am currently seeking internship opportunities to further enhance
              my skills and gain practical experience in the field of software
              engineering.
            </p>
            <FindMe />
            <p className="text-grayText font-cencschit text-sm mt-1">
              Or sent an email to me at{" "}
              <HighlightedText
                text="Jsah737@gmail.com"
                link="mailto:jsah737@gmail.com"
              />{" "}
            </p>
            <TechStack />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cv;
