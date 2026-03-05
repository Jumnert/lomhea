"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  placeName: string;
  placeId: string;
  /** Controlled mode — pass open+onOpenChange from a parent */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Instagram icon (not in Lucide, so we use a custom SVG)
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// WhatsApp icon
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const shareOptions = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-[#1877F2] hover:bg-[#1664d3] text-white",
    getUrl: (url: string, name: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    color: "bg-black hover:bg-zinc-800 text-white",
    getUrl: (url: string, name: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${name} on Lomhea! 🇰🇭`)}`,
  },
  {
    name: "Instagram",
    icon: InstagramIcon,
    color:
      "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90 text-white",
    getUrl: (url: string, name: string) => `https://www.instagram.com/`,
  },
  {
    name: "WhatsApp",
    icon: WhatsAppIcon,
    color: "bg-[#25D366] hover:bg-[#20b858] text-white",
    getUrl: (url: string, name: string) =>
      `https://wa.me/?text=${encodeURIComponent(`Check out ${name} on Lomhea! 🗺️ ${url}`)}`,
  },
];

export function ShareDialog({
  placeName,
  placeId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ShareDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled
    ? (controlledOnOpenChange ?? setInternalOpen)
    : setInternalOpen;
  const [copied, setCopied] = useState(false);

  const placeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/place/${placeId}`
      : `https://lomhea.com/place/${placeId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(placeUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleShare = (getUrl: (url: string, name: string) => string) => {
    const url = getUrl(placeUrl, placeName);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <>
      {/* Trigger button only in uncontrolled (standalone) mode */}
      {!isControlled && (
        <Button
          size="lg"
          variant="secondary"
          className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
          onClick={() => setIsOpen(true)}
        >
          <Share2 size={18} className="mr-2" />
          Share
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-3xl">
          {/* Header */}
          <div className="bg-primary p-6 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Share2 className="bg-white/20 p-1 rounded-lg" size={26} />
              Share this place
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-1 text-sm">
              Share{" "}
              <span className="font-semibold text-white">{placeName}</span> with
              your friends.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-5">
            {/* Social share grid */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">
                Share on social
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.name}
                      className={`h-11 rounded-xl font-semibold text-sm justify-start gap-2 transition-all active:scale-95 ${option.color}`}
                      onClick={() => handleShare(option.getUrl)}
                    >
                      <Icon size={18} />
                      {option.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-zinc-100 dark:bg-zinc-800" />

            {/* Copy link */}
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">
                Or copy link
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <Input
                    readOnly
                    value={placeUrl}
                    className="h-11 pl-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs focus-visible:ring-1 ring-primary/50 text-zinc-500 shadow-none"
                  />
                </div>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-xl shrink-0 transition-all active:scale-95"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
