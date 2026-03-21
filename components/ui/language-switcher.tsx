"use client";

import { useUIStore } from "@/stores/uiStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";

const FLAGS = {
  EN: "https://flagcdn.com/w80/gb.png",
  KH: "https://flagcdn.com/w80/kh.png",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore();

  useEffect(() => {
    if (language === "KH") {
      document.body.style.fontFamily =
        "var(--font-kantumruy), var(--font-inter), sans-serif";
    } else {
      document.body.style.fontFamily = "var(--font-inter), sans-serif";
    }
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none group shrink-0 relative h-10 w-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-xl border border-white/20 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-900 transition-all">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={FLAGS[language]}
              className="object-cover"
              alt={language}
            />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black">
              {language}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl p-2 font-bold shadow-2xl border-zinc-100 dark:border-zinc-800/50"
      >
        <DropdownMenuItem
          onClick={() => setLanguage("EN")}
          className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5"
        >
          <img
            src={FLAGS.EN}
            className="w-6 h-4 object-cover rounded-sm border shadow-sm"
            alt="EN"
          />
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("KH")}
          className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5"
        >
          <img
            src={FLAGS.KH}
            className="w-6 h-4 object-cover rounded-sm border shadow-sm"
            alt="KH"
          />
          <span className="font-kantumruy">ភាសាខ្មែរ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
