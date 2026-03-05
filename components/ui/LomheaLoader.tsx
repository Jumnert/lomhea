"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LomheaLoaderProps {
  className?: string;
  size?: number;
}

export function LomheaLoader({ className }: LomheaLoaderProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Animated Glow / Blur Effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl"
      />

      {/* Text with Fade In/Out Pulse */}
      <motion.h1
        animate={{
          opacity: [0.4, 1, 0.4],
          scale: [0.98, 1, 0.98],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-4xl font-black tracking-[0.4em] text-zinc-900 dark:text-white uppercase italic"
      >
        LOMHEA
      </motion.h1>
    </div>
  );
}
