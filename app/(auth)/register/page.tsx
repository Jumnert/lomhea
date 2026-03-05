"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Map as MapIcon,
  Compass,
  Heart,
  Image as ImageIcon,
  User,
  ChevronLeft,
} from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signUp.email({
        email,
        password,
        name,
        callbackURL: "/",
      });

      if (res) {
        setEmailSent(true);
        toast.success("Account created! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google") => {
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
            {/* Left Side - Brand / Info (Reuse login style) */}
            <div className="relative m-4 rounded-3xl bg-[url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200')] bg-cover bg-center p-12 text-white overflow-hidden">
              <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-12 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <MapIcon className="text-primary" size={24} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">
                    Lomhea
                  </span>
                </div>

                <h1 className="mb-6 text-5xl font-bold leading-tight">
                  Start Your Cambodian Adventure
                </h1>
                <p className="mb-12 text-xl text-white/90 font-medium">
                  Create an account to save your favorite temples, beaches, and
                  waterfalls.
                </p>

                <div className="mt-auto space-y-6">
                  {[
                    {
                      icon: <Compass size={18} />,
                      title: "Track Exploration",
                      desc: "Keep a history of places you've visited",
                    },
                    {
                      icon: <Heart size={18} />,
                      title: "Save Favorites",
                      desc: "Quick access to your must-see destinations",
                    },
                    {
                      icon: <ImageIcon size={18} />,
                      title: "Share Reviews",
                      desc: "Help others by sharing your experiences",
                    },
                  ].map(({ icon, title, desc }, i) => (
                    <div key={i} className="flex items-center group">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-primary transition-all">
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

            {/* Right Side - Form or Success View */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <div className="mx-auto w-full max-w-md">
                {emailSent ? (
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                      <Mail size={40} />
                    </div>
                    <h2 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-white">
                      Check Your Email
                    </h2>
                    <p className="mb-8 text-zinc-500 dark:text-zinc-400">
                      We've sent a verification link to{" "}
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {email}
                      </span>
                      . Please verify your account to continue your adventure.
                    </p>
                    <div className="space-y-4">
                      <button
                        onClick={() => setEmailSent(false)}
                        className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Back to Register
                      </button>
                      <Link
                        href="/login"
                        className="block w-full text-center text-sm font-bold text-primary hover:underline"
                      >
                        Wait, I'm already verified! Sign In
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Create Account
                      </h2>
                      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                        Join the Lomhea community today
                      </p>
                    </div>

                    <div className="mb-8">
                      <button
                        onClick={() => handleSocialSignIn("google")}
                        type="button"
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          className="h-5 w-5"
                          alt="Google"
                        />
                        Sign up with Google
                      </button>
                    </div>

                    <div className="relative mb-8 text-center text-xs">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                      </div>
                      <span className="relative bg-white dark:bg-zinc-900 px-4 text-zinc-400 uppercase tracking-widest font-bold">
                        Or use email
                      </span>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <User className="h-5 w-5 text-zinc-400" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-11 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

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
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                          Password
                        </label>
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
                            placeholder="Minimum 8 characters"
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
                          "Create Account"
                        )}
                      </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-bold text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
