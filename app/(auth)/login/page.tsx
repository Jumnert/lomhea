"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Compass,
  Heart,
  Image as ImageIcon,
  ChevronLeft,
} from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const discordEnabled = Boolean(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      toast.success("Welcome back to Lomhea!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "discord") => {
    try {
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (error: any) {
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="z-10 w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-6 group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Map</span>
        </Link>

        <div className="bg-white dark:bg-zinc-900 overflow-hidden rounded-[40px] shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="grid min-h-[700px] lg:grid-cols-2">
            {/* Left Side - Brand / Info */}
            <div className="relative m-4 overflow-hidden rounded-3xl bg-[url('/heroImg/angkotwat.jpg')] bg-cover bg-center p-12 text-white">
              <div className="absolute inset-0 bg-primary/35" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-12">
                  <span className="text-2xl font-bold tracking-tight">Lomhea</span>
                </div>

                <h1 className="mb-2 text-4xl font-bold leading-tight md:text-[2.75rem]">
                  Discover the Heart of Cambodia
                </h1>
                <p className="mb-12 max-w-xl text-base font-medium text-white/90 md:text-lg">
                  Track your journeys, save your favorite spots, and contribute
                  to the community.
                </p>

                <div className="mt-auto space-y-6">
                  {[
                    {
                      icon: <Compass size={18} />,
                      title: "Interactive Maps",
                      desc: "Explore every corner of Cambodia visually",
                    },
                    {
                      icon: <Heart size={18} />,
                      title: "Personal Favorites",
                      desc: "Keep a collection of places you love",
                    },
                    {
                      icon: <ImageIcon size={18} />,
                      title: "Community Photos",
                      desc: "Share and view real photos from travelers",
                    },
                  ].map(({ icon, title, desc }, i) => (
                    <div key={i} className="flex items-center group">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/20 text-white backdrop-blur-md">
                        {icon}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{title}</div>
                        <div className="text-sm text-white/70">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    Sign in to continue your exploration
                  </p>
                </div>

                <div className="mb-8">
                  <div
                    className={`grid gap-3 ${discordEnabled ? "sm:grid-cols-2" : ""}`}
                  >
                    <button
                      onClick={() => handleSocialSignIn("google")}
                      type="button"
                      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        className="h-5 w-5"
                        alt="Google"
                      />
                      Sign in with Google
                    </button>
                    {discordEnabled && (
                      <button
                        onClick={() => handleSocialSignIn("discord")}
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-[#5865F2] px-4 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.01] hover:bg-[#4752c4] active:scale-[0.99]"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-5 w-5 fill-current"
                        >
                          <path d="M20.317 4.369A19.791 19.791 0 0 0 15.558 3c-.206.375-.444.88-.608 1.275a18.27 18.27 0 0 0-5.9 0A12.89 12.89 0 0 0 8.442 3a19.736 19.736 0 0 0-4.76 1.369C.671 8.874-.146 13.268.263 17.602a19.9 19.9 0 0 0 5.84 2.95c.472-.648.892-1.333 1.252-2.049a12.98 12.98 0 0 1-1.97-.95c.165-.12.326-.245.482-.374 3.798 1.785 7.916 1.785 11.67 0 .158.13.319.255.482.374a12.92 12.92 0 0 1-1.973.951c.36.715.78 1.4 1.253 2.048a19.87 19.87 0 0 0 5.842-2.95c.48-5.026-.82-9.38-3.824-13.233ZM8.02 14.93c-1.14 0-2.078-1.047-2.078-2.332 0-1.286.918-2.333 2.078-2.333 1.17 0 2.097 1.057 2.078 2.333 0 1.285-.918 2.332-2.078 2.332Zm7.96 0c-1.14 0-2.078-1.047-2.078-2.332 0-1.286.918-2.333 2.078-2.333 1.17 0 2.097 1.057 2.078 2.333 0 1.285-.909 2.332-2.078 2.332Z" />
                        </svg>
                        Sign in with Discord
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative mb-8 text-center text-xs">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                  </div>
                  <span className="relative bg-white dark:bg-zinc-900 px-4 text-zinc-400 uppercase tracking-widest font-bold">
                    Or use email
                  </span>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-zinc-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        Password
                      </label>
                      <Link
                        href="#"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Lock className="h-5 w-5 text-zinc-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-11 pr-12 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-zinc-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-zinc-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group relative flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  New to Lomhea?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-primary hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
