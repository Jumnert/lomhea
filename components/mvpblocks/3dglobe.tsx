"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import LightRays from "@/components/ui/LightRays";
import SparklesText from "@/components/ui/sparkles-text";

export default function Globe3D() {
  return (
    <section
      className="relative w-full overflow-hidden bg-white min-h-screen flex flex-col items-center justify-center pt-24 pb-20 font-light text-zinc-900 antialiased"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)",
      }}
    >
      {/* Dynamic LightRays Background */}
      <div className="absolute inset-0 w-full pointer-events-none z-0 opacity-40 overflow-hidden">
        <LightRays
          raysOrigin="top-center"
          raysColor="#000000"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.2}
          noiseAmount={0.1}
          distortion={0.3}
          pulsating={true}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 text-center md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <h1 className="mx-auto mb-8 max-w-5xl text-6xl font-black md:text-5xl lg:text-7xl text-zinc-900 tracking-tighter uppercase leading-[0.95]">
            Explore{" "}
            <SparklesText
              text="Cambodia"
              textClassName="bg-linear-to-b from-black to-zinc-400 bg-clip-text text-transparent"
              colors={{ first: "#000000", second: "#71717a" }}
              sparklesCount={12}
            />
            <br /> like never before
          </h1>
          <p className="mx-auto mb-10 max-w-4xl text-xl text-zinc-500 md:text-2xl font-medium tracking-tight">
            Lomhea connects you to the hidden gems and timeless traditions of
            Cambodia through an interactive experience designed for the modern
            explorer.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              prefetch={false}
              href="/register"
              className="relative w-full overflow-hidden rounded-full border border-zinc-200 bg-zinc-900 px-16 py-5 text-white shadow-xl transition-all duration-300 hover:bg-black sm:w-auto font-black uppercase tracking-widest text-sm"
            >
              Start Exploring
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative z-10 mx-auto max-w-[90vw] lg:max-w-7xl overflow-hidden rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white/40">
            <img
              src="/heroImg/whitevarient.png"
              alt="Lomhea Dashboard Preview"
              width={1920}
              height={1080}
              className="h-auto w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
