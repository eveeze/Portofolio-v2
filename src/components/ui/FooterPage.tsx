import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const FooterPage = () => {
  const footerRef = useRef(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const reachOutRef = useRef<HTMLDivElement>(null);
  const developmentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup - hide elements
      gsap.set(
        [socialsRef.current, reachOutRef.current, developmentRef.current],
        {
          opacity: 0,
          y: 30,
        }
      );

      // Create timeline for footer animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate sections with stagger
      tl.to([socialsRef.current, reachOutRef.current, developmentRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.2,
      });

      // Hover animations for social links
      if (socialsRef.current) {
        const socialLinks = socialsRef.current.querySelectorAll("a");
        socialLinks.forEach((link: HTMLAnchorElement) => {
          link.addEventListener("mouseenter", () => {
            gsap.to(link, {
              scale: 1.1,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          link.addEventListener("mouseleave", () => {
            gsap.to(link, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        });
      }

      // Email hover animation
      if (reachOutRef.current) {
        const emailLink = reachOutRef.current.querySelector("a");
        if (emailLink) {
          emailLink.addEventListener("mouseenter", () => {
            gsap.to(emailLink, {
              letterSpacing: "0.1em",
              duration: 0.3,
              ease: "power2.out",
            });
          });

          emailLink.addEventListener("mouseleave", () => {
            gsap.to(emailLink, {
              letterSpacing: "0",
              duration: 0.3,
              ease: "power2.out",
            });
          });
        }
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="w-full bg-transparent text-whiteText py-12 px-6 relative"
    >
      {/* Subtle background overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex justify-between items-start relative z-10">
        {/* SOCIALS Section */}
        <div ref={socialsRef} className="flex-1">
          <h2
            className="text-sm mb-6 tracking-widest opacity-60"
            style={{ fontFamily: "centsbook" }}
          >
            ( SOCIALS )
          </h2>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-sm hover:text-quotes transition-colors duration-300 cursor-pointer"
              style={{ fontFamily: "centsbook" }}
            >
              IG
            </a>
            <a
              href="#"
              className="text-sm hover:text-quotes transition-colors duration-300 cursor-pointer"
              style={{ fontFamily: "centsbook" }}
            >
              LI
            </a>
            <a
              href="#"
              className="text-sm hover:text-quotes transition-colors duration-300 cursor-pointer"
              style={{ fontFamily: "centsbook" }}
            >
              TW
            </a>
            <a
              href="#"
              className="text-sm hover:text-quotes transition-colors duration-300 cursor-pointer"
              style={{ fontFamily: "centsbook" }}
            >
              SA
            </a>
          </div>
        </div>

        {/* REACH OUT Section */}
        <div ref={reachOutRef} className="flex-1 text-center">
          <h2
            className="text-sm mb-6 tracking-widest opacity-60"
            style={{ fontFamily: "centsbook" }}
          >
            ( REACH OUT )
          </h2>
          <a
            href="mailto:jsah737@gmail.com"
            className="text-sm hover:text-quotes transition-all duration-300 cursor-pointer inline-block"
            style={{ fontFamily: "centsbook" }}
          >
            JSAH737@GMAIL.COM
          </a>
        </div>

        {/* DEVELOPMENT Section */}
        <div ref={developmentRef} className="flex-1 text-right">
          <h2
            className="text-sm mb-6 tracking-widest opacity-60"
            style={{ fontFamily: "centsbook" }}
          >
            ( DEVELOPMENT )
          </h2>
          <p
            className="text-sm text-grayText"
            style={{ fontFamily: "centsbook" }}
          >
            BASED IN YOGYAKARTA
          </p>
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-quotes/20 to-transparent"></div>
    </footer>
  );
};

export default FooterPage;
