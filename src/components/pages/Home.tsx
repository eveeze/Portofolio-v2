import FeaturedProjects from "../fragments/home/FeaturedProjects";
import Hero from "../fragments/home/Hero";

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero + Quotes Section */}
      <section className="w-full bg-background2 -mt-10 md:-mt-11 lg:-mt-12">
        <Hero />
      </section>

      {/* Featured Projects Section */}
      <section className="w-full">
        <div className="p-4 md:p-8">
          <FeaturedProjects />
        </div>
      </section>
    </div>
  );
};

export default Home;
