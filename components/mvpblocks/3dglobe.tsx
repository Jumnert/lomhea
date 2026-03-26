"use client";

import { motion } from "framer-motion";
import Prism from "@/components/Prism";

export default function Globe3D() {
  return (
    <section
      className="relative w-full overflow-hidden bg-zinc-100 min-h-screen flex flex-col items-center justify-start pt-36 md:pt-44 pb-20 font-light text-zinc-900 antialiased"
      style={{
        background: "linear-gradient(135deg, #f1f3f7 0%, #e8ecf3 100%)",
      }}
    >
      {/* Prism Background */}
      <div className="absolute inset-x-0 -top-[10%] -bottom-[6%] w-full pointer-events-none z-0 opacity-65 overflow-hidden">
        <Prism
          animationType="rotate"
          palette="cambodia"
          glow={0.9}
          noise={0.02}
          scale={2.4}
          colorFrequency={0.9}
          bloom={0.9}
          timeScale={0.45}
          suspendWhenOffscreen={true}
          maxDpr={1}
          targetFps={30}
          quality="medium"
        />
      </div>

      <div className="relative z-10 container mx-auto mt-6 md:mt-10 max-w-7xl px-4 text-center md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="mx-auto mb-7 flex w-full max-w-5xl flex-col items-center text-white tracking-tighter uppercase leading-[0.92]">
            <h1 className="text-4xl font-black md:text-5xl lg:text-6xl">
              Explore
            </h1>
            <h1 className="mt-1 text-center text-4xl font-black md:text-5xl lg:text-6xl">
              Cambodia
            </h1>
            <h1 className="mt-1 text-4xl font-black md:text-5xl lg:text-6xl">
              like never before
            </h1>
          </div>
          <p className="mx-auto mb-9 max-w-4xl text-base text-zinc-500 md:text-xl font-medium tracking-tight">
            Lomhea connects you to the hidden gems and timeless traditions of
            Cambodia through an interactive experience designed for the modern
            explorer.
          </p>
        </motion.div>

        <motion.div
          className="relative px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative z-10 mx-auto max-w-[90vw] overflow-hidden rounded-[40px] border border-white/40 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] lg:max-w-7xl">
            <img
              src="/heroImg/whitevarient.png"
              alt="Lomhea Dashboard Preview"
              width={1920}
              height={1080}
              className="h-auto w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[40px] ring-1 ring-white/30" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
