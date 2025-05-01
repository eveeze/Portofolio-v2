import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";

const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

// Daftar teks state yang akan ditampilkan
const TEXT_STATES = ["SCROLL", "S C R L"];

const BottomText: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrambleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [displayText, setDisplayText] = useState<string>(TEXT_STATES[0]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Fungsi animasi scramble ke target text
  const scrambleTo = (target: string) => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
    }
    let pos = 0;
    scrambleIntervalRef.current = setInterval(() => {
      const scrambled = target
        .split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }
          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          return CHARS[randomCharIndex];
        })
        .join("");
      setDisplayText(scrambled);
      pos++;
      if (pos >= target.length * CYCLES_PER_LETTER) {
        clearInterval(scrambleIntervalRef.current!);
        scrambleIntervalRef.current = null;
        // Pastikan diakhiri dengan teks target
        setDisplayText(target);
      }
    }, SHUFFLE_TIME);
  };

  // Setiap kali activeIndex berubah, jalankan animasi scramble
  useEffect(() => {
    const target = TEXT_STATES[activeIndex];
    scrambleTo(target);
  }, [activeIndex]);

  // Timer untuk mengganti state setiap 3 detik
  useEffect(() => {
    const toggleInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TEXT_STATES.length);
    }, 3000);
    return () => clearInterval(toggleInterval);
  }, []);

  // Animasi entrance untuk komponen BottomText (saat mount)
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      );
    }
  }, []);

  // Menggunakan IntersectionObserver untuk memantau apakah section Profile terlihat
  useEffect(() => {
    const profileSection = document.getElementById("profile-section");
    if (!profileSection || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Jika Profile terlihat, tampilkan BottomText dengan animasi huruf masuk secara stagger
            gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.3 });
            if (!containerRef.current) return;
            const letters = containerRef.current.querySelectorAll(".letter");
            gsap.fromTo(
              letters,
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                duration: 0.5,
                ease: "power2.out",
              },
            );
          } else {
            // Jika Profile tidak terlihat, animasi keluar huruf secara stagger ke bawah dan sembunyikan kontainer
            if (!containerRef.current) return;
            const letters = containerRef.current.querySelectorAll(".letter");
            gsap.to(letters, {
              y: 20,
              opacity: 0,
              stagger: 0.05,
              duration: 0.3,
              ease: "power2.in",
              onComplete: () => {
                if (containerRef.current) {
                  gsap.set(containerRef.current, { autoAlpha: 0 });
                }
              },
            });
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(profileSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-1/2 p-4 transform -translate-x-1/2"
    >
      {/* Bungkus teks dengan { } dan pisahkan setiap huruf dengan span */}
      <span className="font-centsbook text-quotes">
        {"{"}
        {displayText.split("").map((char, index) => (
          <span key={index} className="inline-block letter">
            {char}
          </span>
        ))}
        {"}"}
      </span>
    </div>
  );
};

export default BottomText;
