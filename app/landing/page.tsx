"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STATS = [
  { value: "5,000+", label: "Verified Locations" },
  { value: "25", label: "Provinces Covered" },
  { value: "100%", label: "Community Powered" },
  { value: "0", label: "Paywalls" },
];

const CATEGORIES = [
  { id: "01", name: "Temples", color: "bg-amber-400", count: "340+" },
  { id: "02", name: "Beaches", color: "bg-sky-400", count: "210+" },
  { id: "03", name: "Nature", color: "bg-emerald-500", count: "580+" },
  { id: "04", name: "Waterfalls", color: "bg-violet-400", count: "140+" },
  { id: "05", name: "Markets", color: "bg-rose-400", count: "290+" },
  { id: "06", name: "Museums", color: "bg-orange-400", count: "70+" },
];

const STEPS = [
  {
    num: "I",
    title: "Discover",
    body: "A traveler in Mondulkiri finds an unmarked waterfall. Opens Google Maps, copies the link.",
  },
  {
    num: "II",
    title: "Submit",
    body: "Pastes the link into Lomhea. Coordinates are extracted automatically. No technical knowledge required.",
  },
  {
    num: "III",
    title: "Verified",
    body: "Admins review and approve. The discovery is live on the map within hours. A push notification confirms it.",
  },
];

export default function SwissLandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-white text-zinc-900 font-sans overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* ─── GRID OVERLAY (aesthetic only) ─── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ─── HEADER ─── */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-amber-400" />
          <span className="font-black text-xl tracking-tighter">LOMHEA</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
          <a href="#about" className="hover:text-black transition-colors">
            Mission
          </a>
          <a href="#map" className="hover:text-black transition-colors">
            The Map
          </a>
          <a href="#process" className="hover:text-black transition-colors">
            Process
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-xs font-black uppercase tracking-[0.2em] bg-black text-white px-5 py-2.5 hover:bg-amber-400 hover:text-black transition-all"
          >
            Get Started →
          </Link>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="relative z-10 px-8 md:px-16 pt-16 md:pt-24 pb-0 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          {/* Label */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">
              Cambodia — Kingdom of Wonder
            </span>
          </div>

          {/* Giant Swiss headline */}
          <h1
            className={`text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter mb-0 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            The Map
            <br />
            <span className="text-zinc-200">Cambodia</span>
            <br />
            <span className="text-amber-400">Deserved.</span>
          </h1>

          {/* Description + Image side by side */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-0 mt-12 border-t border-zinc-100 pt-12">
            <div className="space-y-6 pr-8 mb-8 md:mb-0">
              <p className="text-sm leading-relaxed text-zinc-500 font-medium max-w-xs">
                Lomhea is a precision mapping platform powered by the community.
                Every temple, beach, waterfall, and hidden path — verified,
                located, and open to all.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:border-amber-400 hover:text-amber-600 transition-all group"
              >
                Start Exploring
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

            {/* Hero image — full bleed to edge */}
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              <img
                src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=2000&auto=format&fit=crop"
                alt="Angkor Wat at Golden Hour"
                className="w-full h-full object-cover object-center"
              />
              {/* Swiss-style label overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Angkor Wat — Siem Reap Province
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">
                    13.4125° N, 103.8670° E
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="relative z-10 border-t border-b border-zinc-100 mt-0">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`py-10 px-6 ${i < STATS.length - 1 ? "border-r border-zinc-100" : ""}`}
              >
                <p className="text-5xl font-black tabular-nums tracking-tighter text-black mb-1">
                  {stat.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="relative z-10 py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">
                Identity
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-8">
              Not a travel app.
              <br />
              <span className="text-zinc-300">A living atlas.</span>
            </h2>
            <p className="text-zinc-500 leading-relaxed font-medium text-sm max-w-md">
              Traditional travel guides are static. Lomhea is alive. Every pin
              is a real human experience, contributed by someone who stood at
              that exact location and decided it was worth sharing with the
              world. We verify it. We map it. We keep it.
            </p>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1200&auto=format&fit=crop"
              alt="Cambodian riverside"
              className="w-full aspect-square object-cover object-center"
            />
            <div className="absolute top-0 right-0 w-1/2 h-8 bg-amber-400" />
            <div className="absolute bottom-0 left-0 w-8 h-1/2 bg-amber-400" />
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES GRID ─── */}
      <section
        id="map"
        className="relative z-10 bg-zinc-950 text-white py-24 px-8 md:px-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-8 bg-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">
                  What We Map
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">
                Six Categories.
                <br />
                Infinite Discoveries.
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-black uppercase tracking-[0.2em] border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all"
            >
              Open the Map →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 border border-white/10">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.id}
                className="relative group p-8 border-r border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                    {cat.id}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-1">
                  {cat.name}
                </h3>
                <p className="text-lg font-black text-white/20 tabular-nums">
                  {cat.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section id="process" className="relative z-10 py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px w-12 bg-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">
              The Process
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border-t border-zinc-100">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`pt-10 pb-10 ${i < STEPS.length - 1 ? "md:border-r border-zinc-100 md:pr-10 md:mr-0" : ""} ${i > 0 ? "md:pl-10" : ""} ${i > 0 ? "border-t md:border-t-0 border-zinc-100" : ""}`}
              >
                <p className="text-7xl font-black text-zinc-100 tabular-nums leading-none mb-6">
                  {step.num}
                </p>
                <h3 className="text-xl font-black tracking-tighter mb-3">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FULL-BLEED IMAGE ─── */}
      <section className="relative z-10 h-[50vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000&auto=format&fit=crop"
          alt="Cambodia coastline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-400 mb-4">
              Community Powered
            </p>
            <p className="text-2xl md:text-4xl font-black tracking-tighter max-w-2xl">
              "Every hidden place deserves to be found."
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 py-32 px-8 md:px-16 bg-amber-400">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-black mb-6">
              Your next
              <br />
              discovery
              <br />
              is waiting.
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-black/70 text-sm leading-relaxed font-medium">
              Join the community of explorers who are rewriting Cambodia's
              travel map— one hidden gem at a time. Free. Open. Real.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 bg-black text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-4 hover:bg-zinc-800 transition-all"
              >
                Join the Community →
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 border-2 border-black text-black text-xs font-black uppercase tracking-[0.2em] px-8 py-4 hover:bg-black hover:text-white transition-all"
              >
                Explore the Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-zinc-100 px-8 md:px-16 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-amber-400" />
            <span className="font-black tracking-tighter text-sm">LOMHEA</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Kingdom of Wonder · {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <Link href="/login" className="hover:text-black transition-colors">
              Log In
            </Link>
            <Link
              href="/register"
              className="hover:text-black transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
