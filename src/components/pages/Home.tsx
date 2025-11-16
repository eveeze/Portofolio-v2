// src/components/pages/Home.tsx
import FeaturedProjects from "../fragments/home/FeaturedProjects";
import Hero from "../fragments/home/Hero";

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero + Quotes Section */}
      <section className="w-full bg-background2">
        {/* Tidak perlu h-screen & overflow-hidden, biarkan Hero yang atur tinggi */}
        <div className="p-4 md:p-6">
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
