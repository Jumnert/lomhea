"use client";

import { useState, useRef } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Compass,
  Heart,
  Image as ImageIcon,
  User,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const discordEnabled = Boolean(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"register" | "otp">("register");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();

  // Step 1: Register user account
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

      if (res?.error) {
        toast.error(res.error.message || "Failed to create account");
        return;
      }

      // Send OTP
      const otpRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpRes.ok) {
        const err = await otpRes.json();
        toast.error(err.error || "Failed to send verification code");
        return;
      }

      const otpData = await otpRes.json();
      setStep("otp");

      // Dev mode: auto-fill the OTP boxes if the server returns the code
      if (otpData.devCode) {
        const digits = otpData.devCode.split("");
        setOtpDigits(digits);
        toast.warning(`🔑 Dev mode — your code is: ${otpData.devCode}`, {
          duration: 15000,
          description:
            "No verified domain yet. Verify at resend.com/domains to send to real users.",
        });
      } else {
        toast.success(
          "Account created! Check your email for the 4-digit code.",
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 4-digit OTP
  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 4) {
      toast.error("Please enter the 4-digit code");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid code");
        return;
      }

      toast.success("Email verified! Signing you in...");
      // Sign in after verification
      await signIn.email({ email, password, callbackURL: "/" });
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("New code sent to your email");
      setOtpDigits(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    // Auto-submit when all 4 filled
    if (digit && index === 3 && newDigits.every((d) => d !== "")) {
      setTimeout(() => handleVerifyOtp(), 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSocialSignIn = async (provider: "google" | "discord") => {
    try {
      await signIn.social({ provider, callbackURL: "/" });
    } catch {
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
            {/* Left Side */}
            <div className="relative m-4 overflow-hidden rounded-3xl bg-[url('/heroImg/bokor.jpg')] bg-cover bg-center p-12 text-white">
              <div className="absolute inset-0 bg-primary/35" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-12">
                  <span className="text-2xl font-bold tracking-tight">Lomhea</span>
                </div>

                <h1 className="mb-2 text-4xl font-bold leading-tight md:text-[2.75rem]">
                  Start Your Cambodian Adventure
                </h1>
                <p className="mb-12 max-w-xl text-base font-medium text-white/90 md:text-lg">
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
                    <div key={i} className="flex items-center">
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

            {/* Right Side */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <div className="mx-auto w-full max-w-md">
                {/* ── OTP STEP ── */}
                {step === "otp" ? (
                  <div>
                    <div className="mb-8 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Mail size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Check your email
                      </h2>
                      <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
                        We sent a 4-digit code to{" "}
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {email}
                        </span>
                      </p>
                    </div>

                    {/* 4-box OTP input */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={inputRefs[i]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={cn(
                            "h-16 w-14 rounded-2xl border-2 text-center text-2xl font-bold transition-all outline-none",
                            "bg-zinc-50 dark:bg-zinc-900",
                            digit
                              ? "border-primary text-zinc-900 dark:text-white"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-400",
                            "focus:border-primary focus:ring-4 focus:ring-primary/10",
                          )}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otpDigits.some((d) => !d)}
                      className="w-full h-14 rounded-2xl bg-primary text-lg font-bold text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {otpLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={20} />
                          Verify Code
                        </>
                      )}
                    </button>

                    <div className="mt-5 flex items-center justify-center gap-4 text-sm">
                      <button
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="flex items-center gap-1.5 text-primary hover:underline font-medium disabled:opacity-50"
                      >
                        {resending ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        Resend code
                      </button>
                      <span className="text-zinc-300">·</span>
                      <button
                        onClick={() => setStep("register")}
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium"
                      >
                        Change email
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── REGISTER FORM ── */
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
                          Sign up with Google
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
                            Sign up with Discord
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-8 text-center text-xs">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
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
                            minLength={8}
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
