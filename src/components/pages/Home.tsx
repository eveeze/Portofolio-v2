// src/components/pages/Home.tsx
import FeaturedProjects from "../fragments/home/FeaturedProjects";
import Hero from "../fragments/home/Hero";

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section - Full screen */}
      <section className="w-full h-screen relative overflow-hidden">
        <div className="h-full p-4 md:p-6">
          <Hero />
        </div>
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
