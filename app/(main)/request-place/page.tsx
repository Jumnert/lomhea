"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  MapPin,
  Tag,
  AlignLeft,
  Link as LinkIcon,
  ImagePlus,
  MessageSquare,
  Send,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const provinces = [
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

const categories = [
  "Temple",
  "Beach",
  "Nature",
  "Waterfall",
  "Market",
  "Museum",
];

export default function RequestPlacePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // In a real app, we would send the data to /api/requests
    // and handle Cloudinary uploads.
    // For MVP, we'll simulate the success.

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Request submitted! We'll review it soon.");
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-6 group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Discovery</span>
        </Link>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary p-8 md:p-12 text-white">
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Suggest a Place
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg mt-2">
              Help us grow the map! Tell us about a hidden gem in Cambodia.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Place Name (EN)</Label>
                  <div className="relative">
                    <Input
                      id="nameEn"
                      placeholder="e.g. Koh Ker"
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                    <AlignLeft
                      className="absolute left-3 top-3.5 text-zinc-400"
                      size={18}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameKh">Place Name (KH)</Label>
                  <div className="relative">
                    <Input
                      id="nameKh"
                      placeholder="e.g. កោះកេរ្ដិ៍"
                      className="pl-10 h-12 rounded-xl"
                    />
                    <AlignLeft
                      className="absolute left-3 top-3.5 text-zinc-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select required>
                    <SelectTrigger id="province" className="h-12 rounded-xl">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-zinc-400" />
                        <SelectValue placeholder="Select province" />
                      </div>
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
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger id="category" className="h-12 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag size={18} className="text-zinc-400" />
                        <SelectValue placeholder="Select category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
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
                    placeholder="https://google.com/maps/..."
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                  <LinkIcon
                    className="absolute left-3 top-3.5 text-zinc-400"
                    size={18}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  We use this to verify coordinates.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us what makes this place special..."
                  className="min-h-[120px] rounded-xl resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Photos (1-3)</Label>
                <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ImagePlus size={24} />
                  </div>
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Why should this be added?</Label>
                <div className="relative">
                  <Textarea
                    id="reason"
                    placeholder="e.g. It's a newly discovered waterfall with clean water..."
                    className="pl-10 min-h-[100px] rounded-xl resize-none"
                    required
                  />
                  <MessageSquare
                    className="absolute left-3 top-3.5 text-zinc-400"
                    size={18}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
