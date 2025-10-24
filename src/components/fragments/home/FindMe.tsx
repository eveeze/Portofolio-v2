// src/components/fragmeents/home/FindMe.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
  InstagramLogoIcon,
  VideoIcon,
  ArrowTopRightIcon,
} from "@radix-ui/react-icons";
interface SocialMediaLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}
const FindMe = () => {
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const socialMediaLinks: SocialMediaLink[] = [
    {
      name: "GitHub",
      url: "https://github.com/eveeze",
      icon: <GitHubLogoIcon className="w-5 h-5" />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/tito-zaki-saputro-6a854a229/",
      icon: <LinkedInLogoIcon className="w-5 h-5" />,
    },
    {
      name: "Twitter",
      url: "https://x.com/EVEEZE69",
      icon: <TwitterLogoIcon className="w-5 h-5" />,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/ev2eze/",
      icon: <InstagramLogoIcon className="w-5 h-5" />,
    },
    {
      name: "Youtube",
      url: "https://www.youtube.com/channel/UCCcCSLanjHRnUawO2LpoxBg",
      icon: <VideoIcon className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    // Initialize GSAP animations
    linkRefs.current.forEach((link) => {
      if (link) {
        gsap.set(link, { borderBottomColor: "#292929" });

        // Set up hover events
        link.addEventListener("mouseenter", () => {
          gsap.to(link, {
            borderBottomColor: "#d1d5db", // gray-300
            duration: 0.3,
            ease: "power1.out",
          });
          const arrow = link.querySelector(".arrowRight");
          if (arrow) {
            gsap.to(arrow, {
              rotation: 90,
              duration: 0.3,
              ease: "power1.out",
            });
          }
        });

        link.addEventListener("mouseleave", () => {
          gsap.to(link, {
            borderBottomColor: "#292929",
            duration: 0.3,
            ease: "power1.out",
          });
          const arrow = link.querySelector(".arrowRight");
          if (arrow) {
            gsap.to(arrow, {
              rotation: 0,
              duration: 0.3,
              ease: "power1.out",
            });
          }
        });
      }
    });

    return () => {
      linkRefs.current.forEach((link) => {
        if (link) {
          link.removeEventListener("mouseenter", () => {});
          link.removeEventListener("mouseleave", () => {});
        }
      });
    };
  }, []);

  return (
    <div className="text-whiteText mt-2">
      <h2 className="text-lg mb-2 font-semibold font-centsbook">Find me on</h2>
      <div className="flex flex-wrap gap-4 font-cencschit justify-between">
        {socialMediaLinks.map((link, index) => (
          <a
            key={link.name}
            href={link.url}
            ref={(el) => {
              linkRefs.current[index] = el;
            }}
            className=" border-b-2 border-grayText text-md transition duration-500 ease-in-out"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center space-x-1 cursor-pointer">
              {link.icon}
              <span>{link.name}</span>
              <ArrowTopRightIcon className="arrowRight w-4 h-4 overflow-hidden" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FindMe;
