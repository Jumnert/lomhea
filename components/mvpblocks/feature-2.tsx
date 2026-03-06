"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  IconUsers,
  IconMapPin,
  IconShieldCheck,
  IconRoute,
  IconStar,
} from "@tabler/icons-react";

const features = [
  {
    step: "Step 1",
    title: "Authentic Reviews",
    content:
      "Read genuine experiences from fellow travelers who explored the Kingdom.",
    icon: <IconUsers className="h-6 w-6" />,
    image:
      "https://images.unsplash.com/photo-1544644113-5b57fe31cb12?q=80&w=1200&auto=format&fit=crop",
  },
  {
    step: "Step 2",
    title: "Interactive Map",
    content:
      "Navigate through Cambodia's regions with our high-performance interactive map.",
    icon: <IconMapPin className="h-6 w-6" />,
    image:
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    step: "Step 3",
    title: "Secure & Trusted",
    content:
      "Verified data and secure bookings with local operators and guides.",
    icon: <IconShieldCheck className="h-6 w-6" />,
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  },
  {
    step: "Step 4",
    title: "Pro Nomad",
    content:
      "Unlock hidden gems, offline maps, and personalized travel itineraries.",
    icon: <IconRoute className="h-6 w-6" />,
    image:
      "https://images.unsplash.com/photo-1510672981848-a1c4f1cb58f3?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function FeatureSteps() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (4000 / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress]);

  return (
    <div className={"p-8 md:p-12"}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mx-auto mb-12 max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h2 className="font-geist text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl dark:text-white">
              The Nomad's Toolkit
            </h2>
            <p className="font-geist text-foreground/60 mt-3 dark:text-neutral-400">
              Everything you need to plan your journey, from community insights
              to advanced offline maps.
            </p>
          </div>
        </div>
        <hr className="bg-foreground/30 mx-auto mb-10 h-px w-1/2" />

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
          <div className="order-2 space-y-8 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8"
                initial={{ opacity: 0.3, x: -20 }}
                animate={{
                  opacity: index === currentFeature ? 1 : 0.3,
                  x: 0,
                  scale: index === currentFeature ? 1.05 : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 md:h-14 md:w-14",
                    index === currentFeature
                      ? "border-white bg-white/10 text-white scale-110 [box-shadow:0_0_15px_rgba(255,255,255,0.3)]"
                      : "border-muted-foreground bg-muted",
                  )}
                >
                  {feature.icon}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className={cn(
              "border-white/10 relative order-1 h-[200px] overflow-hidden rounded-xl border [box-shadow:0_5px_30px_-15px_rgba(255,255,255,0.1)] md:order-2 md:h-[300px] lg:h-[400px]",
            )}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 overflow-hidden rounded-lg"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="h-full w-full transform object-cover transition-transform hover:scale-105"
                        width={1000}
                        height={500}
                      />
                      <div className="from-background via-background/50 absolute right-0 bottom-0 left-0 h-2/3 bg-linear-to-t to-transparent" />

                      <div className="bg-black/80 absolute bottom-4 left-4 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                        <span className="text-white text-xs font-medium">
                          {feature.step}
                        </span>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
