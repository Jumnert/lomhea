"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import {
  Github,
  Linkedin,
  Twitter,
  MessageCircle,
  ArrowDownLeft,
} from "lucide-react";
import { IconMapPin } from "@tabler/icons-react";

const data = () => ({
  navigation: {
    product: [
      { name: "Interactive Map", href: "#explore" },
      { name: "Collections", href: "#destinations" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  },
  socialLinks: [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
  ],
  bottomLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
});

export default function FooterStandard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  if (!mounted) return null;

  return (
    <footer className="mt-20 w-full bg-white border-t border-zinc-100">
      <div className="h-px w-full bg-linear-to-r from-transparent via-zinc-200 to-transparent" />
      <div className="relative w-full px-5 overflow-hidden min-h-[750px]">
        {/* Background Text */}
        <div className="absolute -bottom-16 left-0 right-0 pointer-events-none select-none opacity-[0.18] flex justify-center w-full overflow-hidden">
          <h1 className="text-[23vw] font-black leading-none tracking-tighter whitespace-nowrap bg-linear-to-b from-zinc-800 to-zinc-400 bg-clip-text text-transparent">
            LOMHEA
          </h1>
        </div>

        {/* Top Section */}
        <div className="container m-auto grid grid-cols-1 gap-12 py-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter text-zinc-900">
                Lomhea
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Lomhea is Cambodia's premier interactive travel guide, dedicated
              to sharing the beauty of the Kingdom with the world.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {data().socialLinks.map(({ icon: Icon, label, href }) => (
                  <Button
                    key={label}
                    size="icon"
                    variant="outline"
                    asChild
                    className="hover:bg-white dark:hover:bg-white border-white/10! hover:border-white! cursor-pointer shadow-none transition-all duration-500 hover:scale-110 hover:-rotate-12 hover:text-black hover:shadow-md"
                  >
                    <Link href={href}>
                      <Icon className="h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full max-w-md space-y-3"
            >
              <label htmlFor="email" className="block text-sm font-medium">
                Subscribe to our newsletter
              </label>
              <div className="relative w-full">
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="h-12 w-full"
                  required
                />
                <Button
                  type="submit"
                  className="absolute top-1.5 right-1.5 cursor-pointer transition-all duration-1000 hover:px-10 bg-white text-black hover:bg-zinc-200"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Get the latest updates, travel tips, and exclusive itineraries.
              </p>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="grid w-full grid-cols-2 items-start justify-between gap-8 px-5 lg:col-span-3">
            {(["product", "company", "legal"] as const).map((section) => (
              <div key={section} className="w-full">
                <h3 className="mb-4 -ml-5 border-l-2 border-zinc-900 pl-5 text-sm font-black tracking-wider uppercase text-zinc-900">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h3>
                <ul className="space-y-3">
                  {data().navigation[section].map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="group text-zinc-500 hover:text-zinc-900 -ml-5 inline-flex items-center gap-2 transition-all duration-500 hover:pl-5 font-bold"
                      >
                        <ArrowDownLeft className="text-zinc-400 rotate-225 opacity-30 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100 sm:group-hover:rotate-225 md:rotate-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="animate-rotate-3d via-primary h-px w-full bg-linear-to-r from-transparent to-transparent" />
        <div className="text-zinc-400 container m-auto flex flex-col items-center justify-between gap-4 p-4 text-xs md:flex-row md:px-0 md:text-sm font-bold">
          <p className="">
            &copy; {currentYear} Lomhea Team | All rights reserved
          </p>
          <div className="flex items-center gap-4">
            {data().bottomLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-zinc-900">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <span className="from-zinc-50 absolute inset-x-0 bottom-0 left-0 -z-10 h-1/3 w-full bg-linear-to-t" />
      </div>

      {/* Animations */}
      <style jsx>{`
        /* ===== Animation Presets ===== */
        .animate-rotate-3d {
          animation: rotate3d 8s linear infinite;
        }

        .animate-energy-flow {
          animation: energy-flow 4s linear infinite;
          background-size: 200% 100%;
        }

        /* ===== Keyframes ===== */
        @keyframes rotate3d {
          0% {
            transform: rotateY(0);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @keyframes energy-flow {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </footer>
  );
}
