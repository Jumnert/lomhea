"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

// Define Lomhea plans
const plans = [
  {
    name: "EXPLORER",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: [
      "Interactive Global Map",
      "Up to 10 Bookmarks",
      "Community Reviews",
      "Standard Support",
      "No Offline Access",
    ],
    description: "Free forever for the occasional traveler",
    buttonText: "Get Started",
    href: "/register",
    isPopular: false,
  },
  {
    name: "NOMAD",
    price: "9.99",
    yearlyPrice: "7.99",
    period: "per month",
    features: [
      "Full Offline Map Access",
      "Detailed Regional Guides",
      "Priority Support",
      "3D Landmark Views",
      "Unlimited Bookmarks",
      "Exclusive Itineraries",
    ],
    description: "Perfect for local explorers and travelers",
    buttonText: "Go Pro",
    href: "/register",
    isPopular: true,
  },
  {
    name: "PARTNER",
    price: "29.99",
    yearlyPrice: "24.99",
    period: "per month",
    features: [
      "Everything in Nomad",
      "Public API Access",
      "Featured Listings",
      "Custom Marketing Tools",
      "SSO Authentication",
      "Lead Generation tools",
    ],
    description: "For businesses and professional partners",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

export default function CongestedPricing() {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#FFFFFF", "#A1A1AA", "#71717A", "#F4F4F5"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container mx-auto py-20">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl dark:text-white">
          Transparency for Every Explorer.
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line dark:text-neutral-400">
          Choose the plan that fits your journey.
          {"\n"}All plans include access to our base interactive maps and
          community.
        </p>
      </div>

      <div className="mb-10 flex justify-center items-center gap-4">
        <span
          className={cn(
            "text-sm",
            isMonthly ? "font-bold text-white" : "text-neutral-500",
          )}
        >
          Monthly
        </span>
        <label className="relative inline-flex cursor-pointer items-center">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative data-[state=checked]:bg-white data-[state=unchecked]:bg-zinc-800"
            />
          </Label>
        </label>
        <span
          className={cn(
            "text-sm",
            !isMonthly ? "font-bold text-white" : "text-neutral-500",
          )}
        >
          Yearly <span className="text-white/60 ml-1">(Save 20%)</span>
        </span>
      </div>

      <div className="sm:2 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `bg-black relative rounded-[32px] border p-10 text-center flex flex-col`,
              plan.isPopular ? "border-white border-2" : "border-white/10",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2
                ? "z-0 translate-x-0 translate-y-0 transform"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left",
            )}
          >
            {plan.isPopular && (
              <div className="bg-white absolute top-0 right-10 -translate-y-1/2 flex items-center rounded-full px-4 py-1">
                <Star className="text-black h-3 w-3 fill-current" />
                <span className="text-black ml-1 text-[10px] font-black tracking-widest uppercase">
                  MOST POPULAR
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.3em]">
                {plan.name}
              </p>
              <div className="mt-8 flex items-baseline justify-center gap-x-1">
                <span className="text-white text-6xl font-black tracking-tighter">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                <span className="text-neutral-500 text-sm font-medium">
                  /mo
                </span>
              </div>

              <p className="text-neutral-500 text-xs mt-2 uppercase tracking-wide">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-10 flex flex-col gap-4">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-center gap-3"
                  >
                    <Check className="text-white h-4 w-4" />
                    <span className="text-white/60 text-sm font-medium">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <Link
                  prefetch={false}
                  href={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "w-full h-14 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-300",
                    plan.isPopular
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-transparent text-white border-white/20 hover:bg-white hover:text-black",
                  )}
                >
                  {plan.buttonText}
                </Link>
                <p className="text-neutral-600 mt-6 text-[10px] uppercase tracking-wider">
                  {plan.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
