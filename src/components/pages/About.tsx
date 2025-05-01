import Capabilities from "../fragments/about/Capabilities";
import Location from "../fragments/about/Location";
import Profile from "../fragments/about/Profile";
import Quotes from "../fragments/about/Quotes";
import HeaderWeb from "../fragments/HeaderWeb";
import UnderDevelopment from "../ui/UnderDevelopment";
const About = () => {
  const isUnderDevelopment = import.meta.env.VITE_APP_ENV === "development";

  if (isUnderDevelopment) {
    return <UnderDevelopment />;
  }
  return (
    <section className="px-2 mx-auto w-full min-h-screen">
      <div className="mb-0 space-y-0 tracking-tight leading-40">
        <Profile />
        <HeaderWeb />
        <Quotes />
        <Location />
        <Capabilities />
      </div>
    </section>
  );
};

export default About;
