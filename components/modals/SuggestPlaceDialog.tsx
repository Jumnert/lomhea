"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  MapPin,
  Tag,
  AlignLeft,
  Link as LinkIcon,
  ImagePlus,
  MessageSquare,
  Send,
  Loader2,
  X,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useWebHaptics } from "web-haptics/react";
import { PROVINCES, CATEGORIES } from "@/lib/constants";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SuggestPlaceDialog() {
  const { trigger } = useWebHaptics();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nameEn: "",
    nameKh: "",
    province: "",
    category: "",
    googleMapUrl: "",
    description: "",
    reason: "",
    images: [] as string[],
    lat: "",
    lng: "",
  });

  const [isResolving, setIsResolving] = useState(false);

  // Extract lat/lng from Google Maps URL automatically
  useEffect(() => {
    async function resolve() {
      if (!formData.googleMapUrl) return;

      const extractCoords = (url: string) => {
        const latM = url.match(/!3d(-?\d+\.\d+)/);
        const lngM = url.match(/!4d(-?\d+\.\d+)/);
        if (latM && lngM) return { lat: latM[1], lng: lngM[1] };
        const atM = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atM) return { lat: atM[1], lng: atM[2] };
        const qM = url.match(/[?&](?:query|q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qM) return { lat: qM[1], lng: qM[2] };
        return null;
      };

      const coords = extractCoords(formData.googleMapUrl);
      if (coords) {
        setFormData((p) => ({ ...p, lat: coords.lat, lng: coords.lng }));
        return;
      }

      const isShortLink =
        formData.googleMapUrl.includes("goo.gl") ||
        formData.googleMapUrl.includes("t.ly") ||
        formData.googleMapUrl.includes("maps.app.goo.gl") ||
        formData.googleMapUrl.length < 50;

      if (isShortLink) {
        setIsResolving(true);
        try {
          const res = await fetch("/api/utils/resolve-map-link", {
            method: "POST",
            body: JSON.stringify({ url: formData.googleMapUrl }),
          });
          const data = await res.json();
          if (data.lat && data.lng) {
            setFormData((p) => ({ ...p, lat: data.lat, lng: data.lng }));
          }
        } catch (e) {
          console.error("Resolution failed:", e);
        } finally {
          setIsResolving(false);
        }
      }
    }
    resolve();
  }, [formData.googleMapUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length >= 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }

    setIsUploading(true);
    const file = files[0];
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, result.url],
      }));
      toast.success("Photo uploaded successfully");
      trigger(20);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.province || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/requests/submit", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      trigger([{ duration: 30 }, { delay: 60, duration: 40, intensity: 1 }]);
      toast.success("Suggestion submitted! We'll review it soon.");
      setIsOpen(false);
      setFormData({
        nameEn: "",
        nameKh: "",
        province: "",
        category: "",
        googleMapUrl: "",
        description: "",
        reason: "",
        images: [],
        lat: "",
        lng: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-auto mr-0 text-zinc-400 hover:text-primary"
          title="Suggest a new place"
        >
          <Plus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl [&_button[data-slot=dialog-close]]:text-white">
        <div className="bg-primary p-4 sm:p-6 text-white text-left">
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Plus className="bg-white/20 p-1 rounded-lg" size={24} />
            Suggest a Place
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 mt-1 text-[11px] sm:text-sm">
            Help us expand the map by sharing a hidden gem in Cambodia.
          </DialogDescription>
        </div>

        <ScrollArea className="max-h-[80vh]">
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6 text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Place Name (EN)</Label>
                <div className="relative">
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="e.g. Koh Ker"
                    className="pl-9 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus-visible:ring-1 ring-primary/50"
                    required
                  />
                  <AlignLeft
                    className="absolute left-3 top-3.5 text-zinc-400"
                    size={16}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameKh">Place Name (KH)</Label>
                <div className="relative">
                  <Input
                    id="nameKh"
                    value={formData.nameKh}
                    onChange={(e) =>
                      setFormData({ ...formData, nameKh: e.target.value })
                    }
                    placeholder="e.g. កោះកេរ្ដិ៍"
                    className="pl-9 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus-visible:ring-1 ring-primary/50"
                  />
                  <AlignLeft
                    className="absolute left-3 top-3.5 text-zinc-400"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select
                  required
                  value={formData.province}
                  onValueChange={(v) =>
                    setFormData({ ...formData, province: v })
                  }
                >
                  <SelectTrigger
                    id="province"
                    className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus:ring-1 ring-primary/50"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-zinc-400" />
                      <SelectValue placeholder="Select province" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger
                    id="category"
                    className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus:ring-1 ring-primary/50"
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-zinc-400" />
                      <SelectValue placeholder="Select category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
              <div className="relative">
                <Input
                  id="googleMapsUrl"
                  type="url"
                  value={formData.googleMapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapUrl: e.target.value })
                  }
                  placeholder="https://google.com/maps/..."
                  className="pl-9 pr-20 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus-visible:ring-1 ring-primary/50"
                  required
                />
                <LinkIcon
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={16}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        trigger(20);
                        setFormData({ ...formData, googleMapUrl: text });
                        toast.success("Link pasted from clipboard!");
                      }
                    } catch (e) {
                      toast.error("Clipboard permission denied");
                    }
                  }}
                  className="absolute right-2 top-1.5 h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-primary flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  <ClipboardPaste size={12} />
                  Paste
                </button>
              </div>
              <p
                className={cn(
                  "text-[10px] ml-1 transition-all duration-300 mt-1",
                  isResolving
                    ? "text-amber-500 font-bold animate-pulse"
                    : formData.lat && formData.googleMapUrl
                      ? "text-emerald-600 font-bold"
                      : "text-zinc-400",
                )}
              >
                {isResolving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={10} className="animate-spin" />
                    Resolving location...
                  </span>
                ) : formData.lat && formData.googleMapUrl ? (
                  <span className="flex items-center gap-1.5">
                    <Check size={10} strokeWidth={4} />
                    Pin Pointed: {Number(formData.lat).toFixed(4)},{" "}
                    {Number(formData.lng).toFixed(4)}
                  </span>
                ) : (
                  "Paste link to automatically resolve coordinates."
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tell us what makes this place special..."
                className="min-h-[100px] rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus-visible:ring-1 ring-primary/50 resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Photos ({formData.images.length}/3)</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {formData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 group"
                  >
                    <Image
                      src={img}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {formData.images.length < 3 && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <ImagePlus
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                    )}
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Why should we add it?</Label>
              <div className="relative">
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g. Hidden gem with great local food..."
                  className="pl-9 min-h-[80px] rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none focus-visible:ring-1 ring-primary/50 resize-none"
                  required
                />
                <MessageSquare
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={16}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Suggestion
                </>
              )}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
