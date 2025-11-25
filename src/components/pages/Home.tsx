import FeaturedProjects from "../fragments/home/FeaturedProjects";
import Hero from "../fragments/home/Hero";

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero + Quotes Section */}
      <section className="w-full  -mt-10 md:-mt-11 lg:-mt-12">
        <Hero />
      </section>

      {/* Featured Projects Section */}
      <section className="w-full">
        <FeaturedProjects />
      </section>
    </div>
  );
};

export default Home;
