"use client";

import React, { useState, useEffect } from "react";
import {
  Map as MapIcon,
  Heart,
  Search,
  X,
  MapPin,
  SlidersHorizontal,
  FilterX,
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
import { useUIStore } from "@/stores/uiStore";
import { useTheme } from "next-themes";
import { SuggestPlaceDialog } from "@/components/modals/SuggestPlaceDialog";
import { AddPlaceDialog } from "@/components/ui/add-place-dialog";
import { ProfileDialog } from "@/components/modals/ProfileDialog";

import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useWebHaptics } from "web-haptics/react";
import { NotificationBell } from "./NotificationBell";
import { useQuery } from "@tanstack/react-query";
import { Place } from "@/types/app";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const {
    searchQuery,
    setSearchQuery,
    setSelectedPlaceId,
    category,
    setCategory,
    province,
    setProvince,
    minRating,
    setMinRating,
    resetFilters,
  } = useMapStore();
  const { setPanelOpen, language } = useUIStore();
  const { resolvedTheme, setTheme } = useTheme();
  const { trigger } = useWebHaptics();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(searchQuery);
  const [recentSearchIds, setRecentSearchIds] = useState<string[]>([]);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchCacheRef = React.useRef<Map<string, Place[]>>(new Map());
  const RECENT_SEARCHES_KEY = "lomhea_recent_searches";

  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ["places"],
    queryFn: async () => {
      const res = await fetch("/api/places");
      if (!res.ok) throw new Error("Failed to fetch places");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery === "") setInputValue("");
  }, [searchQuery]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentSearchIds(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      setRecentSearchIds([]);
    }
  }, []);

  const normalize = React.useCallback((value: string) => {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();
  }, []);

  const suggestions = React.useMemo(() => {
    const key = normalize(inputValue);
    if (!key) return [];

    const cached = searchCacheRef.current.get(key);
    if (cached) return cached;

    const next = places
      .filter((p) => {
        const q = key;
        const name = normalize(p.name);
        const nameKh = normalize(p.nameKh || "");
        const province = normalize(p.province);
        const category = normalize(p.category);

        return (
          name.includes(q) ||
          nameKh.includes(q) ||
          province.includes(q) ||
          category.includes(q)
        );
      })
      .slice(0, 10);

    searchCacheRef.current.set(key, next);
    if (searchCacheRef.current.size > 100) {
      const oldest = searchCacheRef.current.keys().next().value;
      if (oldest) searchCacheRef.current.delete(oldest);
    }
    return next;
  }, [places, inputValue, normalize]);

  const recentPlaces = React.useMemo(() => {
    if (!recentSearchIds.length || !places.length) return [];
    const byId = new Map(places.map((p) => [p.id, p]));
    return recentSearchIds
      .map((id) => byId.get(id))
      .filter((p): p is Place => Boolean(p))
      .slice(0, 6);
  }, [places, recentSearchIds]);

  const visibleResults = React.useMemo(() => {
    return inputValue.trim().length === 0 ? recentPlaces : suggestions;
  }, [inputValue, recentPlaces, suggestions]);

  const provinces = React.useMemo(() => {
    return ["All", ...Array.from(new Set(places.map((p) => p.province))).sort()];
  }, [places]);

  const ratingOptions = [
    { label: "All Ratings", value: "0" },
    { label: "1★ and up", value: "1" },
    { label: "2★ and up", value: "2" },
    { label: "3★ and up", value: "3" },
    { label: "4★ and up", value: "4" },
    { label: "5★ only", value: "5" },
  ];

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    setSearchQuery(value);
    setIsSearchOpen(value.trim().length > 0);
    setActiveIndex(-1);
  };

  const handleSelectPlace = (place: Place) => {
    setInputValue("");
    setSearchQuery("");
    setIsSearchOpen(false);
    setActiveIndex(-1);
    setSelectedPlaceId(place.id);
    setPanelOpen(true);

    setRecentSearchIds((prev) => {
      const next = [place.id, ...prev.filter((id) => id !== place.id)].slice(
        0,
        8,
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    // Force map fly animation even if the same place was already selected.
    setSelectedPlaceId(null);
    requestAnimationFrame(() => {
      setSelectedPlaceId(place.id);
    });
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
    setIsSearchOpen(false);
    setActiveIndex(-1);
    searchInputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearchIds([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isSearchOpen || visibleResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, visibleResults.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        handleSelectPlace(visibleResults[activeIndex]);
      }
    }
  };

  const highlightMatch = (text: string, rawQuery: string) => {
    if (!rawQuery.trim()) return text;
    const idx = text.toLowerCase().indexOf(rawQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-semibold text-foreground">
          {text.slice(idx, idx + rawQuery.length)}
        </span>
        {text.slice(idx + rawQuery.length)}
      </>
    );
  };

  const displayPlaceName = (place: Place) =>
    language === "KH" && place.nameKh ? place.nameKh : place.name;

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
          <div
            ref={searchContainerRef}
            className="relative flex flex-1 md:flex-none items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/5 md:min-w-[360px] focus-within:ring-2 ring-primary/20 transition-all"
          >
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal size={15} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[340px] sm:max-w-[340px]">
                <SheetHeader>
                  <SheetTitle>Map Filters</SheetTitle>
                  <SheetDescription>
                    Filter by province, category, and minimum rating.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-4">
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Temple">Temple</SelectItem>
                        <SelectItem value="Beach">Beach</SelectItem>
                        <SelectItem value="Nature">Nature</SelectItem>
                        <SelectItem value="Waterfall">Waterfall</SelectItem>
                        <SelectItem value="Market">Market</SelectItem>
                        <SelectItem value="Museum">Museum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Rating</Label>
                    <Select
                      value={String(minRating)}
                      onValueChange={(v) => setMinRating(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {ratingOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      resetFilters();
                      setIsFilterOpen(false);
                    }}
                  >
                    <FilterX size={14} className="mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Search size={16} className="text-zinc-400 mr-2 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search temples, beaches..."
              className="bg-transparent border-none outline-none text-sm text-zinc-600 dark:text-zinc-300 w-full placeholder:text-zinc-400"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchOpen(inputValue.trim().length > 0)}
              onKeyDown={handleSearchKeyDown}
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="mr-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
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

            {isSearchOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[70] overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl">
                {inputValue.trim().length === 0 ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/70 dark:border-zinc-800">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Recent Searches
                      </p>
                      {recentPlaces.length > 0 && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            clearRecentSearches();
                          }}
                          className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {recentPlaces.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                        No recent searches yet.
                      </div>
                    ) : (
                      recentPlaces.map((place, index) => (
                        <button
                          key={place.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectPlace(place);
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            activeIndex === index
                              ? "bg-primary/10"
                              : "hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80"
                          }`}
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-primary/80" />
                          <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-800 dark:text-zinc-200">
                          {displayPlaceName(place)}
                        </p>
                            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                              {place.province} · {place.category}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    No results found for "{inputValue}".
                  </div>
                ) : (
                  suggestions.map((place, index) => (
                    <button
                      key={place.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectPlace(place);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        activeIndex === index
                          ? "bg-primary/10"
                          : "hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80"
                      }`}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-primary/80" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-800 dark:text-zinc-200">
                          {highlightMatch(displayPlaceName(place), inputValue)}
                        </p>
                        <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {place.province} · {place.category}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
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
