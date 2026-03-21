"use client";

import { useState, useRef } from "react";
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
];

export function AddPlaceDialog() {
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
    category: "Nature",
    province: "Siem Reap",
    images: [] as string[],
  });

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
      setOpen(false);
      setFormData({
        name: "",
        nameKh: "",
        description: "",
        lat: "",
        lng: "",
        category: "Nature",
        province: "Siem Reap",
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
    if (!formData.lat || !formData.lng) {
      toast.error("Coordinates are required for admin entry");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold bg-zinc-900 text-white rounded-2xl h-11 px-6 shadow-xl shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-4 w-4" /> Add New Place
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl shadow-3xl">
        <div className="bg-zinc-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Plus className="bg-white/10 p-1.5 rounded-xl" size={32} />
            Add Location
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2 font-medium">
            Publish a new verified geography to the official directory.
          </DialogDescription>
        </div>

        <ScrollArea className="max-h-[75vh]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  EN Name
                </Label>
                <div className="relative">
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                    placeholder="Angkor Wat"
                    required
                  />
                  <AlignLeft
                    className="absolute left-3.5 top-4 text-zinc-300"
                    size={16}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  KH Name
                </Label>
                <div className="relative">
                  <Input
                    value={formData.nameKh}
                    onChange={(e) =>
                      setFormData({ ...formData, nameKh: e.target.value })
                    }
                    className="pl-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                    placeholder="អង្គរវត្ត"
                  />
                  <AlignLeft
                    className="absolute left-3.5 top-4 text-zinc-300"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-2xl bg-zinc-50 border-zinc-100 resize-none h-28"
                placeholder="Describe the historical or natural significance..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 border-zinc-100">
                    <div className="flex items-center gap-2 px-1 text-zinc-400">
                      <Tag size={16} />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Province
                </Label>
                <Select
                  value={formData.province}
                  onValueChange={(v) =>
                    setFormData({ ...formData, province: v })
                  }
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 border-zinc-100">
                    <div className="flex items-center gap-2 px-1 text-zinc-400">
                      <MapPin size={16} />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl">
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Latitude
                </Label>
                <div className="relative">
                  <Input
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: e.target.value })
                    }
                    className="pl-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                    placeholder="13.4125"
                    required
                  />
                  <Globe
                    className="absolute left-3.5 top-4 text-zinc-300"
                    size={16}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Longitude
                </Label>
                <div className="relative">
                  <Input
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: e.target.value })
                    }
                    className="pl-10 h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                    placeholder="103.8667"
                    required
                  />
                  <Globe
                    className="absolute left-3.5 top-4 text-zinc-300"
                    size={16}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
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
                    className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all group"
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
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Publish to Directory"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
