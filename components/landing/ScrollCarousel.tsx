"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DESTINATIONS = [
  {
    category: "Sanctuary",
    title: "Angkor Wat",
    src: "https://plus.unsplash.com/premium_photo-1661962946869-4cf54aa4c778?w=1200&auto=format&fit=crop&q=80",
    description:
      "The soul of Cambodia. A UNESCO World Heritage site rising from the jungle mist at dawn — the largest religious monument in the world.",
  },
  {
    category: "Metropolis",
    title: "Phnom Penh",
    src: "https://plus.unsplash.com/premium_photo-1678853633590-3ca0d6013969?w=1200&auto=format&fit=crop&q=80",
    description:
      "The Pearl of Asia. Ancient history meets modern energy at the Royal Palace and the buzzing riverside of Cambodia's vibrant capital.",
  },
  {
    category: "Riverside",
    title: "Kampot",
    src: "https://images.unsplash.com/photo-1677209806836-54e9879c0c25?w=1200&auto=format&fit=crop&q=80",
    description:
      "Timeless charm along the Praek Tuek Chhu river — salt fields, world-renowned pepper farms, and French colonial architecture.",
  },
  {
    category: "Wild Frontier",
    title: "Mondulkiri",
    src: "https://plus.unsplash.com/premium_photo-1664117436445-76133b33b07a?w=1200&auto=format&fit=crop&q=80",
    description:
      "Rolling highlands and remote jungle. Misty waterfalls and indigenous villages — a world away from the heat of the plains.",
  },
  {
    category: "Island",
    title: "Koh Rong",
    src: "https://images.unsplash.com/photo-1708570319591-6823ac3987af?w=1200&auto=format&fit=crop&q=80",
    description:
      "Pristine white sands and turquoise water. Bioluminescent plankton, hammock bars, and sunsets that defy belief.",
  },
  {
    category: "Khmer Spirit",
    title: "Rural Majesty",
    src: "https://images.unsplash.com/photo-1572984011334-290e519d45f6?w=1200&auto=format&fit=crop&q=80",
    description:
      "Intricate carvings, handwoven silk, and the steady rhythm of village life — a living museum of the Khmer spirit.",
  },
];

const TOTAL = DESTINATIONS.length;

export default function ScrollCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let currentIndex = 0;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        // Each card gets one full viewport height of scroll
        end: `+=${(TOTAL - 1) * window.innerHeight}`,
        pin: true,
        pinSpacing: true,
        snap: {
          snapTo: 1 / (TOTAL - 1),
          duration: { min: 0.2, max: 0.4 },
          delay: 0,
          ease: "power2.inOut",
        },
        onUpdate(self) {
          const newIndex = Math.round(self.progress * (TOTAL - 1));
          if (newIndex !== currentIndex) {
            currentIndex = newIndex;
            setActiveIndex(newIndex);
            gsap.to(track, {
              x: -newIndex * window.innerWidth,
              duration: 0.45,
              ease: "power2.inOut",
              overwrite: true,
            });
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="destinations"
      className="relative w-full h-screen overflow-hidden bg-whiten"
    >
      {/* Horizontal card track */}
      <div
        ref={trackRef}
        className="flex h-full will-change-transform items-center"
        style={{ width: `${TOTAL * 100}vw` }}
      >
        {DESTINATIONS.map((dest) => (
          <div
            key={dest.title}
            className="relative w-screen h-full shrink-0 flex items-end p-4 md:p-6"
          >
            {/* Rounded framed image container */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              <img
                src={dest.src}
                alt={dest.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />

              <div className="relative z-10 p-6 md:p-10 pb-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-white/30" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                    {dest.category}
                  </span>
                </div>
                <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-3 leading-[0.9]">
                  {dest.title}
                </h3>
                <p className="text-zinc-300 text-sm md:text-base font-medium leading-relaxed max-w-md">
                  {dest.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {DESTINATIONS.map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-500 rounded-full ${
              i === activeIndex ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Scroll hint — first card only */}
      <div
        className={`absolute bottom-8 right-8 md:right-16 z-20 pointer-events-none transition-opacity duration-500 ${
          activeIndex === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">
          Scroll to explore
        </p>
      </div>
    </section>
  );
}
