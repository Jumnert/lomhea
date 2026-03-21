"use client";

import React, { useRef, useState } from "react";
import LogoLoop from "@/components/LogoLoop";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import Link from "next/link";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import FeatureSteps from "@/components/mvpblocks/feature-2";
import FooterStandard from "@/components/mvpblocks/footer-standard";
import Testimonials from "@/components/mvpblocks/testimonials-marquee";
import Globe3D from "@/components/mvpblocks/3dglobe";

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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">A spiritual odyssey.</span>{" "}
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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">The Pearl of Asia.</span>{" "}
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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">Timeless charm.</span>{" "}
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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">
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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">Lush Landscapes.</span>{" "}
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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">
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
      <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4 border border-zinc-100">
        <p className="text-zinc-600 text-base md:text-2xl max-w-3xl mx-auto font-medium">
          <span className="font-black text-zinc-900">Upper Elevations.</span>{" "}
          Rolling hills and remote forests define the Mondulkiri experience.
          It's a world away from the heat of the plains, offering a cool breeze
          and endless adventure.
        </p>
      </div>
    ),
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const NAV_LINKS = [
    { name: "Explore", link: "#explore" },
    { name: "Destinations", link: "#destinations" },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-white min-h-screen text-zinc-900 selection:bg-zinc-100 selection:text-zinc-900 overflow-x-hidden tracking-tighter"
    >
      {/* Navigation */}
      <Navbar className="top-0! pt-4">
        {/* Desktop Nav */}
        <NavBody className="bg-white/5! backdrop-blur-xl! border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tighter text-zinc-900">
              Lomhea
            </span>
          </div>
          <NavItems items={NAV_LINKS} />
          <div className="flex items-center gap-3">
            {!session ? (
              <>
                <NavbarButton href="/login" variant="secondary">
                  Log in
                </NavbarButton>
                <NavbarButton
                  href="/register"
                  variant="dark"
                  className="rounded-full px-6"
                >
                  Get Started
                </NavbarButton>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9 border-2 border-zinc-100 hover:border-zinc-900 transition-all">
                      <AvatarImage src={session.user.image || undefined} />
                      <AvatarFallback className="bg-zinc-100 text-[10px] font-black uppercase">
                        {session.user.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl p-2 font-bold"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon size={16} /> Profile
                    </Link>
                  </DropdownMenuItem>
                  {(session.user as any).role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 cursor-pointer text-blue-600"
                      >
                        <Shield size={16} /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 cursor-pointer text-rose-500"
                  >
                    <LogOut size={16} /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <LanguageSwitcher />
          </div>
        </NavBody>

        {/* Mobile Nav */}
        <MobileNav className="bg-white/5! backdrop-blur-xl! border border-white/10">
          <MobileNavHeader>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tighter text-zinc-900">
                Lomhea
              </span>
            </div>
            <MobileNavToggle
              isOpen={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                <span className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  Language
                </span>
                <LanguageSwitcher />
              </div>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.link}
                  className="text-lg font-medium text-zinc-900 dark:text-white/80"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/10" />
              <div className="flex flex-col gap-2">
                <NavbarButton
                  href="/login"
                  variant="secondary"
                  className="w-full"
                >
                  Log in
                </NavbarButton>
                <NavbarButton
                  href="/register"
                  variant="dark"
                  className="w-full"
                >
                  Get Started
                </NavbarButton>
              </div>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <Globe3D />

      {/* Partners / Social Proof */}
      <section className="partner-section py-20 border-y border-neutral-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20">
        <div className="container mx-auto px-6 mb-12 text-center text-sm font-medium text-neutral-400 uppercase tracking-[0.2em]">
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
      <section id="destinations" className="py-32">
        <div className="container mx-auto px-6 mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-zinc-900">
            Curated Collections
          </h2>
          <p className="text-zinc-500 max-w-xl font-medium">
            Carefully selected experiences that capture the essence of
            Cambodia's diverse landscape.
          </p>
        </div>

        <Carousel
          items={DESTINATIONS.map((dest, index) => (
            <Card key={dest.title} card={dest} index={index} />
          ))}
          initialScroll={0}
        />
      </section>

      {/* Features Section */}
      <section id="features">
        <FeatureSteps />
      </section>

      {/* Footer */}
      <FooterStandard />
    </div>
  );
}
