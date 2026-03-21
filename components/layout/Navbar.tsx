"use client";

import React, { useState, useEffect } from "react";
import {
  Map as MapIcon,
  Heart,
  Search,
  User,
  LogOut,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import { useMapStore } from "@/stores/mapStore";
import { useTheme } from "next-themes";
import { SuggestPlaceDialog } from "@/components/modals/SuggestPlaceDialog";
import { AddPlaceDialog } from "@/components/ui/add-place-dialog";
import { ProfileDialog } from "@/components/modals/ProfileDialog";

import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useWebHaptics } from "web-haptics/react";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { searchQuery, setSearchQuery } = useMapStore();
  const { resolvedTheme, setTheme } = useTheme();
  const { trigger } = useWebHaptics();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <>
      <nav className="fixed top-6 left-6 right-6 z-40 flex justify-between items-center pointer-events-none">
        {/* Logo */}
        <div className="pointer-events-auto hidden md:flex shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40 dark:border-white/5 hover:scale-105 transition-all"
          >
            <span className="font-bold text-lg tracking-tighter text-zinc-900 dark:text-white px-1">
              Lomhea
            </span>
          </Link>
        </div>

        {/* Main Controls - Search becomes flex-1 on mobile */}
        <div className="flex flex-1 md:flex-none items-center gap-2 md:gap-3 pointer-events-auto">
          {/* Search Bar */}
          <div className="flex flex-1 md:flex-none items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/5 md:min-w-[360px] focus-within:ring-2 ring-primary/20 transition-all">
            <Search size={16} className="text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search temples, beaches..."
              className="bg-transparent border-none outline-none text-sm text-zinc-600 dark:text-zinc-300 w-full placeholder:text-zinc-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {mounted ? (
              ["ADMIN", "MODERATOR"].includes((session?.user as any)?.role) ? (
                <AddPlaceDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-auto mr-0 text-zinc-400 hover:text-primary"
                      title="Add a new place"
                    >
                      <Plus size={18} />
                    </Button>
                  }
                />
              ) : (
                <SuggestPlaceDialog />
              )
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>

          {/* Dark/Light Mode Toggle - Hidden on Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex rounded-2xl w-10 h-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-md border border-white/20 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-900 transition-all"
            onClick={() => {
              trigger(30);
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun size={16} className="text-amber-400" />
              ) : (
                <Moon size={16} className="text-zinc-600" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </Button>

          <div className="flex items-center gap-2 shrink-0">
            {/* Real-time Notifications */}
            {mounted && session && <NotificationBell />}

            {/* Auth / Menu */}
            {mounted ? (
              session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-xl border border-white/20 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-900"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {session.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-56 rounded-2xl p-2 shadow-2xl border-zinc-100 dark:border-zinc-800"
                    align="end"
                    sideOffset={8}
                  >
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="rounded-xl py-2.5 cursor-pointer"
                        onClick={() => setIsProfileOpen(true)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="rounded-xl py-2.5 cursor-pointer"
                        asChild
                      >
                        <Link href="/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favorites</span>
                        </Link>
                      </DropdownMenuItem>

                      {["ADMIN", "MODERATOR", "CONTRIBUTOR"].includes(
                        (session.user as any).role,
                      ) && (
                        <DropdownMenuItem
                          className="rounded-xl py-2.5 cursor-pointer text-primary focus:text-primary focus:bg-primary/5"
                          asChild
                        >
                          <Link href="/admin">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {/* Mobile-Only Toggles */}
                      <DropdownMenuItem
                        className="rounded-xl py-2.5 cursor-pointer md:hidden"
                        onClick={() => {
                          trigger(30);
                          setTheme(resolvedTheme === "dark" ? "light" : "dark");
                        }}
                      >
                        {resolvedTheme === "dark" ? (
                          <>
                            <Sun className="mr-2 h-4 w-4 text-amber-500" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="mr-2 h-4 w-4 text-zinc-500" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <div className="md:hidden px-2 py-1.5 border-t border-zinc-100 dark:border-white/5 mt-1">
                        <LanguageSwitcher />
                      </div>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="rounded-xl py-2.5 cursor-pointer text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-900/20 focus:text-rose-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                !isPending && (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        className="rounded-xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-white/20 dark:border-zinc-800/50"
                      >
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button
                        asChild
                        className="rounded-xl shadow-lg shadow-primary/20"
                      >
                        <Link href="/register">Sign up</Link>
                      </Button>
                    </div>

                    {/* Mobile Burger for Guest */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="sm:hidden rounded-2xl w-10 h-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-xl border border-white/20 dark:border-zinc-800/50"
                        >
                          <Menu size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 rounded-2xl p-2 shadow-2xl border-zinc-100 dark:border-zinc-800 mr-6"
                        align="end"
                        sideOffset={8}
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="rounded-xl py-2.5 cursor-pointer"
                            asChild
                          >
                            <Link href="/login">Log in</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl py-2.5 cursor-pointer"
                            asChild
                          >
                            <Link href="/register">Sign up</Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="rounded-xl py-2.5 cursor-pointer"
                            onClick={() => {
                              trigger(30);
                              setTheme(
                                resolvedTheme === "dark" ? "light" : "dark",
                              );
                            }}
                          >
                            {resolvedTheme === "dark" ? (
                              <>
                                <Sun className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Light Mode</span>
                              </>
                            ) : (
                              <>
                                <Moon className="mr-2 h-4 w-4 text-zinc-500" />
                                <span>Dark Mode</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <div className="px-2 py-1.5">
                            <LanguageSwitcher />
                          </div>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              )
            ) : (
              <div className="h-10 w-10 rounded-full bg-zinc-100/50 dark:bg-zinc-800/50" />
            )}

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
}
