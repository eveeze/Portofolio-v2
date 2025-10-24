import Card from "../../ui/Card";

const Capabilities = () => {
  // Complete contact data with all social media from FindMe component
  const contactData = [
    {
      label: "GET IN TOUCH",
      value: "JSAH737@GMAIL.COM",
      href: "mailto:jsah737@gmail.com",
    },
    {
      label: "GITHUB",
      value: "EVEEZE",
      href: "https://github.com/eveeze",
    },
    {
      label: "LINKEDIN",
      value: "TITO ZAKI SAPUTRO",
      href: "https://www.linkedin.com/in/tito-zaki-saputro-6a854a229/",
    },
    {
      label: "TWITTER",
      value: "@EVEEZE69",
      href: "https://x.com/EVEEZE69",
    },
    {
      label: "INSTAGRAM",
      value: "@EV2EZE",
      href: "https://www.instagram.com/ev2eze/",
    },
    {
      label: "YOUTUBE",
      value: "EVEEZE CHANNEL",
      href: "https://www.youtube.com/channel/UCCcCSLanjHRnUawO2LpoxBg",
    },
  ];

  const sections = [
    {
      id: "I",
      title: "ABOUT",
      subtitle: "INFORMATION",
      borderType: "top-left" as const,
      content: `TITO ZAKI SAPUTRO IS A DYNAMIC FULL-STACK DEVELOPER AND COMPUTER SCIENCE STUDENT AT UNIVERSITAS TEKNOLOGI YOGYAKARTA (UTY) WITH A PROVEN TRACK RECORD IN BUILDING SCALABLE WEB AND MOBILE APPLICATIONS. PROFICIENT IN MODERN TECHNOLOGIES INCLUDING REACT, TYPESCRIPT, NODE.JS, AND FLUTTER, HE HAS SUCCESSFULLY DELIVERED MULTIPLE CLIENT PROJECTS WHILE MAINTAINING ACADEMIC EXCELLENCE. TITO'S DEVELOPMENT APPROACH COMBINES CLEAN CODE PRINCIPLES WITH USER-CENTRIC DESIGN, RESULTING IN PERFORMANT AND INTUITIVE APPLICATIONS. HIS RECENT PROJECTS INCLUDE AN E-COMMERCE PLATFORM WITH 10K+ MONTHLY USERS AND A CROSS-PLATFORM MOBILE APP FOR LOCAL BUSINESSES. CURRENTLY SEEKING OPPORTUNITIES TO LEVERAGE HIS TECHNICAL EXPERTISE IN A CHALLENGING DEVELOPMENT ROLE.`,
    },
    {
      id: "S",
      title: "SKILLS",
      subtitle: "SERVICES",
      borderType: "bottom-right" as const,
      content: `WEB DESIGN

SOCIAL MEDIA

ART DIRECTION

CREATIVE DIRECTION

VISUAL IDENTITY

E-COMMERCE

BRANDING

PACKAGING`,
    },
    {
      id: "G",
      title: "REACH OUT",
      subtitle: "GET IN TOUCH",
      borderType: "top-left" as const,
      content: ``, // Content will be handled by contactData prop
      contactData: contactData, // Complete social media data
    },
  ];

  return (
    <section className="min-h-screen w-full">
      <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col py-12 lg:py-16 text-left max-w-none">
          {/* Single Card component with all sections for proper sequencing */}
          <div className="w-full">
            <Card sections={sections} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
