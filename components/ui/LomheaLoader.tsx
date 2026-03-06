"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LomheaLoaderProps {
  className?: string;
  /** Use "dark" to force white dots (e.g. on a dark background), "light" to force dark dots,
   *  or leave undefined to auto-adapt via Tailwind's dark: variant. */
  variant?: "dark" | "light" | "auto";
}

export function LomheaLoader({
  className,
  variant = "auto",
}: LomheaLoaderProps) {
  const dotColor =
    variant === "dark"
      ? "bg-white"
      : variant === "light"
        ? "bg-zinc-700"
        : "bg-zinc-900 dark:bg-white";

  const labelColor =
    variant === "dark"
      ? "text-white/40"
      : variant === "light"
        ? "text-zinc-400"
        : "text-zinc-400 dark:text-white/40";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        className,
      )}
    >
      {/* Minimal ripple-dot loader */}
      <div className="flex items-center gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className={cn("w-2 h-2 rounded-full", dotColor)}
            animate={{
              opacity: [0.15, 1, 0.15],
              scale: [0.75, 1.25, 0.75],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.18,
            }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "text-[10px] font-black tracking-[0.55em] uppercase",
          labelColor,
        )}
      >
        LOMHEA
      </motion.p>
    </div>
  );
}
