"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  MapPin,
  Tag,
  AlignLeft,
  Link as LinkIcon,
  ImagePlus,
  X,
  Globe,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, ClipboardPaste } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

import { PROVINCES, CATEGORIES } from "@/lib/constants";

export function AddPlaceDialog({
  trigger: customTrigger,
}: {
  trigger?: React.ReactNode;
}) {
  const { trigger } = useWebHaptics();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    nameKh: "",
    description: "",
    lat: "",
    lng: "",
    category: "",
    province: "",
    googleMapUrl: "",
    reason: "",
    images: [] as string[],
  });

  const [isResolving, setIsResolving] = useState(false);

  // Extract lat/lng from Google Maps URL automatically
  useEffect(() => {
    async function resolve() {
      if (!formData.googleMapUrl) return;

      const patterns = [
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // actual pin lat/lng ✓
        /!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/, // reverse — actual pin ✓
        /@(-?\d+\.\d+),(-?\d+\.\d+)/, // viewport center (less accurate)
        /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
        /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/,
        /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      ];

      for (const pattern of patterns) {
        const match = formData.googleMapUrl.match(pattern);
        if (match) {
          if (pattern.source.includes("!4d(-?\\d+\\.\\d+)!3d(-?\\d+\\.\\d+)")) {
            setFormData((p) => ({ ...p, lat: match[2], lng: match[1] }));
          } else {
            setFormData((p) => ({ ...p, lat: match[1], lng: match[2] }));
          }
          return;
        }
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        }),
      });
      if (!res.ok) throw new Error("Failed to create place");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Location published successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
      setOpen(false);
      setFormData({
        name: "",
        nameKh: "",
        description: "",
        lat: "",
        lng: "",
        category: "",
        province: "",
        googleMapUrl: "",
        reason: "",
        images: [],
      });
    },
    onError: () => {
      toast.error("Failed to add location");
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length >= 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setIsUploading(true);
    const file = files[0];
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, result.url],
      }));
      toast.success("Photo added");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if we can extract coordinates before failing
    let finalLat = formData.lat;
    let finalLng = formData.lng;

    if (!finalLat || !finalLng) {
      if (formData.googleMapUrl) {
        const patterns = [
          /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // actual pin lat/lng ✓
          /!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/, // reverse — actual pin ✓
          /@(-?\d+\.\d+),(-?\d+\.\d+)/, // viewport center (less accurate)
          /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
          /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/,
          /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
        ];
        for (const pattern of patterns) {
          const match = formData.googleMapUrl.match(pattern);
          if (match) {
            if (
              pattern.source.includes("!4d(-?\\d+\\.\\d+)!3d(-?\\d+\\.\\d+)")
            ) {
              finalLat = match[2];
              finalLng = match[1];
            } else {
              finalLat = match[1];
              finalLng = match[2];
            }
            break;
          }
        }
      }
    }

    if (!finalLat || !finalLng) {
      toast.error(
        "Could not detect location from Google Maps link. Please ensure the link is valid (contains coordinates like @13.4,103.8).",
      );
      return;
    }

    if (!formData.province || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      ...formData,
      lat: finalLat,
      lng: finalLng,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger || (
          <Button className="font-bold bg-zinc-900 text-white rounded-2xl h-11 px-6 shadow-xl shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> Add New Place
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl shadow-3xl">
        <div className="bg-zinc-900 p-8 text-white relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Plus className="bg-white/10 p-1.5 rounded-xl" size={32} />
            Add Location
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2 font-medium">
            Publish a new verified geography to the official directory.
          </DialogDescription>
        </div>

        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500">
                  Place Name (EN)
                </Label>
                <div className="relative">
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus-visible:ring-1 ring-zinc-200"
                    placeholder="e.g. Angkor Wat"
                    required
                  />
                  <AlignLeft
                    className="absolute left-3.5 top-4 text-zinc-400"
                    size={16}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500">
                  Place Name (KH)
                </Label>
                <div className="relative">
                  <Input
                    value={formData.nameKh}
                    onChange={(e) =>
                      setFormData({ ...formData, nameKh: e.target.value })
                    }
                    className="pl-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus-visible:ring-1 ring-zinc-200"
                    placeholder="អង្គរវត្ត"
                  />
                  <AlignLeft
                    className="absolute left-3.5 top-4 text-zinc-400"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500">
                  Province
                </Label>
                <Select
                  required
                  value={formData.province}
                  onValueChange={(v) =>
                    setFormData({ ...formData, province: v })
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus:ring-1 ring-zinc-200">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-zinc-400" />
                      <SelectValue placeholder="Select province" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500">
                  Category
                </Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus:ring-1 ring-zinc-200">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-zinc-400" />
                      <SelectValue placeholder="Select category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
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
              <Label className="text-xs font-bold text-zinc-500">
                Google Maps Link
              </Label>
              <div className="relative">
                <Input
                  type="url"
                  value={formData.googleMapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapUrl: e.target.value })
                  }
                  placeholder="https://google.com/maps/..."
                  className="pl-10 pr-24 h-12 rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus-visible:ring-1 ring-zinc-200"
                  required
                />
                <LinkIcon
                  className="absolute left-3.5 top-4 text-zinc-400"
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
                  className="absolute right-2 top-2 h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-sm"
                >
                  <ClipboardPaste size={12} className="text-zinc-500" />
                  Paste
                </button>
              </div>
              <p
                className={cn(
                  "text-[10px] ml-1 transition-all duration-300",
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
                    Resolving remote coordinates...
                  </span>
                ) : formData.lat && formData.googleMapUrl ? (
                  <span className="flex items-center gap-1.5">
                    <Check size={10} strokeWidth={4} />
                    Location Lock: {Number(formData.lat).toFixed(4)},{" "}
                    {Number(formData.lng).toFixed(4)}
                  </span>
                ) : (
                  "Paste a link to automatically verify the location."
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus-visible:ring-1 ring-zinc-200 resize-none h-28"
                placeholder="Tell us what makes this place special..."
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-zinc-500">
                Gallery ({formData.images.length}/5)
              </Label>
              <div className="grid grid-cols-5 gap-3">
                {formData.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group ring-2 ring-transparent hover:ring-zinc-900 transition-all"
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
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {formData.images.length < 5 && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
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

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full bg-zinc-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-2xl shadow-zinc-200 transition-all active:scale-95"
                disabled={createMutation.isPending || isUploading}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Publish to Directory
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
