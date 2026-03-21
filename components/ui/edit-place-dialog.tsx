"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Loader2,
  MapPin,
  Tag,
  AlignLeft,
  Link as LinkIcon,
  ImagePlus,
  X,
  Globe,
  Star,
  Trash2,
  MessageSquare,
  Save,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Sihanoukville",
  "Battambang",
  "Kampot",
  "Koh Kong",
  "Kep",
  "Mondulkiri",
  "Ratanakiri",
  "Preah Vihear",
  "Kandal",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kampong Thom",
  "Kratie",
  "Odar Meanchey",
  "Pailin",
  "Pursat",
  "Prey Veng",
  "Stung Treng",
  "Svay Rieng",
  "Takeo",
  "Tboung Khmum",
];

const CATEGORIES = [
  "Temple",
  "Beach",
  "Nature",
  "Waterfall",
  "Market",
  "Museum",
  "Adventure",
  "Cultural",
  "City",
  "Religious",
];

interface EditPlaceDialogProps {
  place: any;
}

export function EditPlaceDialog({ place }: EditPlaceDialogProps) {
  const { trigger } = useWebHaptics();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: place.name || "",
    nameKh: place.nameKh || "",
    description: place.description || "",
    lat: place.lat?.toString() || "",
    lng: place.lng?.toString() || "",
    category: place.category || "",
    province: place.province || "",
    googleMapUrl: "",
    images: place.images || ([] as string[]),
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: place.name || "",
        nameKh: place.nameKh || "",
        description: place.description || "",
        lat: place.lat?.toString() || "",
        lng: place.lng?.toString() || "",
        category: place.category || "",
        province: place.province || "",
        googleMapUrl: "",
        images: place.images || [],
      });
    }
  }, [open, place]);

  const [isResolving, setIsResolving] = useState(false);

  // Extract lat/lng from Google Maps URL automatically
  useEffect(() => {
    async function resolve() {
      if (!formData.googleMapUrl) return;

      const expandedRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = formData.googleMapUrl.match(expandedRegex);
      if (match) {
        setFormData((p) => ({ ...p, lat: match[1], lng: match[2] }));
        return;
      }

      if (formData.googleMapUrl.includes("goo.gl")) {
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

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/places/${place.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        }),
      });
      if (!res.ok) throw new Error("Failed to update place");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Place updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update place");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      toast.success("Review removed");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length >= 10) {
      toast.error("Maximum 10 photos allowed");
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
      toast.success("Image added");
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
      images: prev.images.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast.error("Coordinates are required");
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-zinc-100 transition-all active:scale-95"
        >
          <Pencil size={15} className="text-zinc-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl shadow-3xl">
        <div className="bg-zinc-900 p-8 text-white relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Pencil className="bg-white/10 p-1.5 rounded-xl" size={32} />
            Edit Location
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2 font-medium">
            Modify the details for this geography.
          </DialogDescription>
        </div>

        <ScrollArea className="max-h-[80vh]">
          <div className="p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
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
                    placeholder="Update coordinates from link..."
                    className="pl-10 pr-24 h-12 rounded-2xl bg-zinc-50 border-zinc-100 shadow-none focus-visible:ring-1 ring-zinc-200"
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
                    "text-[10px] ml-1 mt-1 transition-all duration-300",
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
                    "Paste a link to automatically update the location."
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
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-500">
                  Gallery ({formData.images.length}/10)
                </Label>
                <div className="grid grid-cols-5 gap-3">
                  {formData.images.map((img: string, i: number) => (
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
                  {formData.images.length < 10 && (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                    >
                      {isUploading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <ImagePlus size={20} />
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

              <Button
                type="submit"
                className="w-full bg-zinc-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-2xl shadow-zinc-200 transition-all active:scale-95"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                  </>
                )}
              </Button>
            </form>

            {(place.reviews?.length ?? 0) > 0 && (
              <div className="space-y-4 pt-4 border-t border-zinc-100 text-left">
                <div className="flex items-center gap-2 px-1">
                  <MessageSquare size={16} className="text-zinc-900" />
                  <span className="text-sm font-black tracking-tighter uppercase">
                    Community Feedback ({place.reviews.length})
                  </span>
                </div>

                <div className="grid gap-3">
                  {place.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group transition-colors hover:bg-zinc-100/50"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-zinc-200">
                            <AvatarImage src={review.user?.image} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {review.user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-900">
                              {review.user?.name}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={10}
                                  className={
                                    i < review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-zinc-200"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-zinc-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            if (confirm("Delete this review and rating?")) {
                              deleteReviewMutation.mutate(review.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium pl-10">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
