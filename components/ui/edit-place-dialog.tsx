"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Loader2,
  Image as ImageIcon,
  MapPin,
  X,
  ImagePlus,
  Trash2,
  Star,
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
import { toast } from "sonner";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Preah Sihanouk",
  "Kampot",
  "Kep",
  "Battambang",
  "Koh Kong",
  "Mondulkiri",
  "Ratanakiri",
  "Kampong Cham",
];

const CATEGORIES = [
  "Nature",
  "Cultural",
  "Beach",
  "City",
  "Adventure",
  "Religious",
];

interface EditPlaceDialogProps {
  place: any;
}

export function EditPlaceDialog({ place }: EditPlaceDialogProps) {
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
    category: place.category || "Nature",
    province: place.province || "Siem Reap",
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
        category: place.category || "Nature",
        province: place.province || "Siem Reap",
        images: place.images || [],
      });
    }
  }, [open, place]);

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
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <Pencil size={14} className="text-zinc-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            Edit Location
          </DialogTitle>
          <DialogDescription className="font-medium">
            Modify the details for this geography.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                EN Name
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                KH Name
              </Label>
              <Input
                value={formData.nameKh}
                onChange={(e) =>
                  setFormData({ ...formData, nameKh: e.target.value })
                }
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="rounded-xl resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Province
              </Label>
              <Select
                value={formData.province}
                onValueChange={(val) =>
                  setFormData({ ...formData, province: val })
                }
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Latitude
              </Label>
              <Input
                value={formData.lat}
                onChange={(e) =>
                  setFormData({ ...formData, lat: e.target.value })
                }
                className="rounded-xl h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Longitude
              </Label>
              <Input
                value={formData.lng}
                onChange={(e) =>
                  setFormData({ ...formData, lng: e.target.value })
                }
                className="rounded-xl h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Gallery ({formData.images.length}/5)
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {formData.images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden border group"
                >
                  <Image
                    src={img}
                    alt="Gallery"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-50 transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <ImagePlus size={16} />
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
              className="w-full bg-zinc-900 text-white rounded-xl h-12 font-black uppercase tracking-widest"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>

        {(place.reviews?.length ?? 0) > 0 && (
          <>
            <div className="flex items-center gap-2 mt-6 mb-4 px-1">
              <MessageSquare size={16} className="text-rose-500" />
              <span className="text-sm font-black tracking-tighter uppercase whitespace-nowrap">
                Community Feedback ({place.reviews.length})
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-3 pb-4">
              {place.reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-700/50 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={review.user?.image} />
                        <AvatarFallback className="text-[8px] font-bold">
                          {review.user?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-zinc-900 dark:text-white leading-none">
                          {review.user?.name}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={8}
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
                      className="h-7 w-7 rounded-lg text-zinc-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        if (confirm("Delete this review and rating?")) {
                          deleteReviewMutation.mutate(review.id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
