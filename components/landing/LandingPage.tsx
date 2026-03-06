"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LaserFlow } from "@/components/ui/laser-flow";
import BlurText from "@/components/BlurText";
import LogoLoop from "@/components/LogoLoop";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconArrowRight,
  IconHeart,
  IconMapPin,
  IconStar,
  IconShieldCheck,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandFacebook,
  IconRoute,
  IconMap,
  IconUsers,
  IconCompass,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import FeatureSteps from "@/components/mvpblocks/feature-2";
import FooterStandard from "@/components/mvpblocks/footer-standard";
import CongestedPricing from "@/components/mvpblocks/congusted-pricing";
import Testimonials from "@/components/mvpblocks/testimonials-marquee";
import { MorphingText } from "@/components/ui/morphing-text";

gsap.registerPlugin(ScrollTrigger);

const LOGOS = [
  {
    src: "/logo/ministryofturism.png",
    alt: "Ministry of Tourism",
  },
  {
    src: "/logo/unesco.png",
    alt: "UNESCO",
  },
  {
    src: "/logo/kingdom of cambodia.png",
    alt: "Kingdom of Cambodia",
  },
  {
    src: "/logo/wonderpass.png",
    alt: "Wonderpass",
  },
  {
    src: "/logo/schoolministry.png",
    alt: "Ministry of Education",
  },
];

const DESTINATIONS = [
  {
    category: "Sanctuary",
    title: "Angkor Wat",
    src: "https://plus.unsplash.com/premium_photo-1661962946869-4cf54aa4c778?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            A spiritual odyssey.
          </span>{" "}
          Angkor Wat is the soul of Cambodia. This UNESCO World Heritage site is
          the largest religious monument in the world, representing the pinnacle
          of classical Khmer architecture and the beating heart of Cambodian
          culture.
        </p>
      </div>
    ),
  },
  {
    category: "Metropolis",
    title: "Phnom Penh",
    src: "https://plus.unsplash.com/premium_photo-1678853633590-3ca0d6013969?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            The Pearl of Asia.
          </span>{" "}
          Phnom Penh is the vibrant capital of Cambodia. From the majestic Royal
          Palace to the bustling markets and riverside promenades, it's where
          ancient history meets modern energy in the heart of the Kingdom.
        </p>
      </div>
    ),
  },
  {
    category: "Riverside",
    title: "Kampot",
    src: "https://images.unsplash.com/photo-1677209806836-54e9879c0c25?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Timeless charm.
          </span>{" "}
          Experience the laid-back atmosphere of Kampot. Famous for its salt
          fields, pepper farms and French colonial architecture along the Praek
          Tuek Chhu river.
        </p>
      </div>
    ),
  },
  {
    category: "Khmer Spirit",
    title: "Rural Majesty",
    src: "https://images.unsplash.com/photo-1572984011334-290e519d45f6?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Heritage in Every Detail.
          </span>{" "}
          Explore the intricate details of Cambodian craftsmanship. This region
          showcases the deep-rooted cultural heritage and artistic traditions
          that have been preserved for generations.
        </p>
      </div>
    ),
  },
  {
    category: "Nature",
    title: "Verdant Fields",
    src: "https://images.unsplash.com/photo-1696564237148-d52f15f4955e?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Lush Landscapes.
          </span>{" "}
          Cambodia's countryside is a sea of green. Experience the tranquility
          of the rice paddies and the rolling hills that define the landscape of
          the heartland.
        </p>
      </div>
    ),
  },
  {
    category: "Island",
    title: "Koh Rong",
    src: "https://images.unsplash.com/photo-1708570319591-6823ac3987af?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Pristine white sands.
          </span>{" "}
          Discover the untouched beauty of Cambodia's islands. Crystal clear
          turquoise waters and a serene atmosphere perfect for escaping the
          modern world.
        </p>
      </div>
    ),
  },
  {
    category: "Wild Frontier",
    title: "Mondulkiri Highlands",
    src: "https://plus.unsplash.com/premium_photo-1664117436445-76133b33b07a?w=800&auto=format&fit=crop&q=60",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-900 p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100 dark:border-white/5">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Upper Elevations.
          </span>{" "}
          Rolling hills and remote forests define the Mondulkiri experience.
          It's a world away from the heat of the plains, offering a cool breeze
          and endless adventure.
        </p>
      </div>
    ),
  },
];

const BENTO_ITEMS = [
  {
    title: "Authentic Reviews",
    description:
      "Read genuine experiences from fellow travelers who explored the Kingdom.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <IconStar
                key={i}
                size={14}
                className="text-yellow-500 fill-yellow-500"
              />
            ))}
          </div>
          <p className="text-sm italic">
            "Lomhea helped me find a hidden waterfall in Kampot that wasn't on
            any other map!"
          </p>
          <span className="text-xs font-bold">- Sarah J.</span>
        </div>
      </div>
    ),
    icon: <IconHeart className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Interactive Map",
    description:
      "Navigate through Cambodia's regions with our high-performance interactive map.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 items-center justify-center overflow-hidden">
        <IconMapPin size={40} className="text-white animate-bounce" />
      </div>
    ),
    icon: <IconMapPin className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2",
  },
  {
    title: "Free Explorer",
    description:
      "Basic access to maps and general information about top attractions.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-zinc-100 dark:bg-zinc-900 items-center justify-center flex-col">
        <span className="text-2xl font-bold">$0</span>
        <span className="text-xs uppercase tracking-widest opacity-50">
          Free Forever
        </span>
      </div>
    ),
    icon: <IconShieldCheck className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Pro Nomad",
    description:
      "Unlock hidden gems, offline maps, and personalized travel itineraries.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-zinc-900 dark:bg-white/5 border border-white/10 items-center justify-center flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-white text-black text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
          POPULAR
        </div>
        <span className="text-2xl font-bold">$9.99</span>
        <span className="text-xs uppercase tracking-widest opacity-50">
          Per Month
        </span>
      </div>
    ),
    icon: <IconShieldCheck className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Secure & Trusted",
    description: "Verified data and secure bookings with local operators.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-zinc-100 dark:bg-zinc-900 items-center justify-center">
        <div className="grid grid-cols-2 gap-2 p-4">
          <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
          <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse delay-75"></div>
          <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse delay-150"></div>
          <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse delay-200"></div>
        </div>
      </div>
    ),
    icon: <IconShieldCheck className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealImgRef = useRef<HTMLDivElement>(null);

  // Magnetic interaction logic
  const handleMouseMove = (e: React.MouseEvent) => {
    const magneticElements = document.querySelectorAll(".magnetic-item");
    magneticElements.forEach((el) => {
      const target = el as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const strength = target.dataset.strength
        ? parseInt(target.dataset.strength)
        : 40;

      if (distance < 120) {
        gsap.to(target, {
          x: x * (strength / 100),
          y: y * (strength / 100),
          duration: 0.6,
          ease: "power2.out",
        });
      } else {
        gsap.to(target, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.3)",
        });
      }
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered logos entrance
      gsap.from(".partner-logo", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".partner-section",
          start: "top 85%",
        },
      });

      // Section reveal enhancements with Skew
      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          y: 60,
          skewX: -2,
          scale: 0.95,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
        });
      });

      // Deep Spatial Parallax for Bento Reveal Grid
      gsap.to(".bento-reveal-grid", {
        yPercent: -35,
        scale: 1.1,
        rotationX: 8,
        filter: "blur(10px)",
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="dark bg-black min-h-screen selection:bg-zinc-800 selection:text-white overflow-x-hidden"
    >
      {/* Navigation */}
      <Navbar className="top-0! pt-4">
        <NavBody className="bg-white/5! backdrop-blur-xl! border border-white/10 shadow-2xl">
          <div
            className="flex items-center gap-2 magnetic-item"
            data-strength="15"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <IconMapPin className="text-black" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tighter dark:text-white">
              Lomhea
            </span>
          </div>
          <NavItems
            items={[
              { name: "Explore", link: "#explore" },
              { name: "Destinations", link: "#destinations" },
              { name: "Pricing", link: "#pricing" },
              { name: "Reviews", link: "#reviews" },
            ]}
          />
          <div className="flex items-center gap-2">
            <NavbarButton href="/login" variant="secondary">
              Log in
            </NavbarButton>
            <NavbarButton
              href="/register"
              variant="dark"
              className="rounded-full px-6 magnetic-item"
              data-strength="20"
            >
              Get Started
            </NavbarButton>
          </div>
        </NavBody>
      </Navbar>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[900px] flex items-center justify-center overflow-hidden bg-black"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const el = revealImgRef.current;
          if (el) {
            el.style.setProperty("--mx", `${x}px`);
            el.style.setProperty("--my", `${y}px`);
          }
        }}
        onMouseLeave={() => {
          const el = revealImgRef.current;
          if (el) {
            el.style.setProperty("--mx", "-9999px");
            el.style.setProperty("--my", "-9999px");
          }
        }}
      >
        <LaserFlow
          color="#FFFFFF"
          horizontalSizing={0.5}
          verticalSizing={2}
          wispDensity={1}
          wispSpeed={15}
          wispIntensity={5}
          flowSpeed={0.35}
          flowStrength={0.25}
          fogIntensity={0.45}
          fogScale={0.3}
          fogFallSpeed={0.6}
          decay={1.1}
          falloffStart={1.2}
          className="opacity-60 -translate-y-[15%] laser-bg"
        />

        {/* The Reveal Layer (Hidden by default, reveals on hover) */}
        <div
          ref={revealImgRef}
          className="absolute inset-0 z-5 pointer-events-none opacity-60 transition-opacity duration-500"
          style={
            {
              WebkitMaskImage:
                "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.98) 120px, rgba(255,255,255,0.7) 240px, rgba(255,255,255,0.3) 360px, rgba(255,255,255,0) 500px)",
              maskImage:
                "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.98) 120px, rgba(255,255,255,0.7) 240px, rgba(255,255,255,0.3) 360px, rgba(255,255,255,0) 500px)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              "--mx": "-9999px",
              "--my": "-9999px",
            } as any
          }
        >
          {/* Bento Reveal Background */}
          <div className="bento-reveal-grid grid grid-cols-6 grid-rows-6 gap-6 w-full h-full p-20 opacity-80 transition-all duration-700 grayscale-[0.5] contrast-[1.1]">
            <img
              src="https://images.unsplash.com/photo-1593009567545-d414364b3d55?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover rounded-3xl col-span-2 row-span-3 shadow-2xl"
              alt=""
            />
            <img
              src="https://images.unsplash.com/photo-1677209627666-4e47b58ab8c7?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover rounded-3xl col-span-3 row-span-2 shadow-2xl"
              alt=""
            />
            <img
              src="https://images.unsplash.com/photo-1698063623350-76bf8da60fd2?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover rounded-3xl col-span-1 row-span-4 shadow-2xl"
              alt=""
            />
            <img
              src="https://plus.unsplash.com/premium_photo-1661962946869-4cf54aa4c778?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover rounded-3xl col-span-2 row-span-2 shadow-2xl"
              alt=""
            />
            <img
              src="https://plus.unsplash.com/premium_photo-1678853633590-3ca0d6013969?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover rounded-3xl col-span-2 row-span-4 shadow-2xl"
              alt=""
            />
            <img
              src="https://images.unsplash.com/photo-1677209806836-54e9879c0c25?w=800&auto=format&fit=crop&q=60"
              className="w-full h-full object-cover rounded-3xl col-span-2 row-span-2 shadow-2xl"
              alt=""
            />
          </div>
        </div>

        {/* Feature Preview Block (Floating over bottom fixed) */}
        <div className="absolute bottom-10 inset-x-0 z-20 flex justify-center px-4 hero-panel">
          <div className="w-full max-w-[85vw]">
            <div className="relative overflow-hidden rounded-[40px] border-2 border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.15)]">
              <div className="aspect-21/13 md:aspect-21/9 w-full bg-neutral-900 overflow-hidden relative">
                <img
                  src="/heroimg/blackvarient.png"
                  className="w-full h-full object-cover opacity-80 grayscale"
                  alt="Lomhea Experience"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/20"></div>
                <div className="absolute bottom-10 left-10 text-left hero-text-block">
                  <span className="text-white/40 font-medium text-xs uppercase tracking-[0.5em] mb-4 block">
                    Lomhea Experience
                  </span>
                  <div className="flex justify-start -ml-1.5">
                    <MorphingText
                      texts={["JOURNEY", "WITH", "LOMHEA"]}
                      className="text-white text-4xl font-bold tracking-tight sm:text-5xl text-left mx-0 h-12 md:h-16"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners / Social Proof */}
      <section className="partner-section py-20 border-y border-neutral-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 reveal-section">
        <div className="container mx-auto px-6 mb-12 text-center text-sm font-medium text-neutral-400 uppercase tracking-[0.2em] partner-logo">
          Proudly Supporting
        </div>
        <LogoLoop
          logos={LOGOS}
          speed={40}
          fadeOut={true}
          logoHeight={64}
          gap={160}
        />
      </section>

      {/* Featured Destinations Carousel */}
      <section id="destinations" className="py-32 reveal-section">
        <div className="container mx-auto px-6 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 dark:text-white">
            Curated Collections
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl">
            Carefully selected experiences that capture the essence of
            Cambodia's diverse landscape.
          </p>
        </div>

        <Carousel
          items={DESTINATIONS.map((dest, index) => (
            <Card key={dest.title} card={dest} index={index} />
          ))}
        />
      </section>

      {/* Features Section */}
      <section id="features" className="reveal-section">
        <FeatureSteps />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="reveal-section bg-black/50 py-20">
        <CongestedPricing />
      </section>

      {/* Testimonials & CTA Section */}
      <section id="cta" className="reveal-section relative overflow-hidden">
        <Testimonials />
      </section>

      {/* Footer */}
      <FooterStandard />
    </div>
  );
}
