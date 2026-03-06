"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("bg-white/10 p-1 py-0.5 font-bold text-white", className)}
    >
      {children}
    </span>
  );
}

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function TestimonialCard({
  description,
  name,
  img,
  role,
  className,
  ...props
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-2xl p-6",
        "border-white/10 bg-zinc-900/50 backdrop-blur-sm border shadow-sm",
        "transition-all duration-300 hover:border-white/20 hover:bg-zinc-800/50",
        className,
      )}
      {...props}
    >
      <div className="text-neutral-400 text-sm font-normal select-none">
        {description}
        <div className="flex flex-row py-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-3 fill-white text-white" />
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-4 select-none">
        <div className="size-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
          <img
            width={40}
            height={40}
            src={
              img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
            }
            alt={name}
            className="size-full object-cover grayscale"
          />
        </div>

        <div>
          <p className="text-white font-bold tracking-tight text-sm">{name}</p>
          <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Sovan Somnang",
    role: "Digital Nomad",
    description: (
      <p>
        Lomhea is by far the most accurate guide to Cambodia.
        <Highlight>
          The offline maps saved me in the Cardamom Mountains.
        </Highlight>{" "}
        Truly a must-have for anyone exploring the Kingdom.
      </p>
    ),
  },
  {
    name: "Elena Rossi",
    role: "Travel Photographer",
    description: (
      <p>
        I found locations through Lomhea that aren't on any other app.
        <Highlight>
          The 3D landmark views helped me plan my golden hour shots.
        </Highlight>{" "}
        Exceptional attention to detail.
      </p>
    ),
  },
  {
    name: "Bory Pich",
    role: "Local Guide",
    description: (
      <p>
        As a local, I'm impressed by how accurately the app reflects our
        culture.
        <Highlight>
          It promotes responsible tourism while showing hidden gems.
        </Highlight>{" "}
        It's the future of travel in Cambodia.
      </p>
    ),
  },
  {
    name: "Marcus Thorne",
    role: "Adventure Enthusiast",
    description: (
      <p>
        The interactive map is incredibly smooth.
        <Highlight>
          Found the secret waterfall in Ratanakiri thanks to this toolkit.
        </Highlight>{" "}
        The UX is world-class.
      </p>
    ),
  },
  {
    name: "Sarah Jenkins",
    role: "Solo Traveler",
    description: (
      <p>
        Safety was my main concern, but Lomhea's verified reviews gave me peace
        of mind.
        <Highlight>The community insights are gold.</Highlight> Felt like having
        a local friend in my pocket.
      </p>
    ),
  },
  {
    name: "Channara Meas",
    role: "Expat in Phnom Penh",
    description: (
      <p>
        Even after living here for 5 years, Lomhea still finds new places for me
        to visit.
        <Highlight>The curated collections are perfectly balanced.</Highlight> A
        masterpiece of curation.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <section className="relative container mx-auto py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-white mb-4 text-center text-5xl leading-[1.1] font-bold tracking-tighter md:text-5xl uppercase">
          Khmer Odyssey Stories
        </h2>
        <p className="text-neutral-500 mx-auto max-w-2xl text-center text-lg font-medium tracking-tight text-balance">
          Join thousands of explorers who have discovered the real Cambodia.
          <span className="block mt-2 text-white font-bold italic text-base">
            "Rediscover the Kingdom with Lomhea"
          </span>
        </p>
      </motion.div>

      <div className="relative mt-12 h-[600px] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn("h-[600px]", {
                  "[--duration:40s]": i === 0,
                  "[--duration:50s]": i === 1,
                  "[--duration:45s]": i === 2,
                })}
              >
                {testimonials.concat(testimonials).map((card, idx) => (
                  <TestimonialCard key={idx} {...card} />
                ))}
              </Marquee>
            ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full bg-linear-to-t from-black to-transparent"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 w-full bg-linear-to-b from-black to-transparent"></div>
      </div>

      <div className="mt-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <a
            href="/register"
            className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105"
          >
            Get Early Access Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
