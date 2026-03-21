"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Send,
  Loader2,
  ChevronLeft,
  ImagePlus,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { cn } from "@/lib/utils";

const provinces = [
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
  "Kandal",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kampong Thom",
  "Kratie",
  "Takeo",
  "Prey Veng",
  "Svay Rieng",
  "Pursat",
  "Stung Treng",
  "Preah Vihear",
  "Pailin",
  "Odar Meanchey",
  "Tboung Khmum",
];

const categories = [
  "Temple",
  "Beach",
  "Nature",
  "Waterfall",
  "Market",
  "Museum",
  "City",
  "Cultural",
  "Adventure",
  "Religious",
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

function EditRequestDialog({
  request,
  onClose,
}: {
  request: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    nameEn: request.nameEn,
    nameKh: request.nameKh || "",
    province: request.province,
    category: request.category,
    googleMapUrl: request.googleMapUrl,
    description: request.description,
    reason: request.reason,
    images: request.images as string[],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request updated!");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      onClose();
    },
    onError: () => toast.error("Failed to update request"),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    const data = new FormData();
    data.append("file", files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setForm((prev) => ({ ...prev, images: [...prev.images, result.url] }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Place Name (EN)</Label>
          <Input
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Place Name (KH)</Label>
          <Input
            value={form.nameKh}
            onChange={(e) => setForm({ ...form, nameKh: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Province</Label>
          <Select
            value={form.province}
            onValueChange={(v) => setForm({ ...form, province: v })}
          >
            <SelectTrigger>
              <SelectValue />
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
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
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
      <div className="space-y-1.5">
        <Label className="text-xs">Google Maps URL</Label>
        <Input
          value={form.googleMapUrl}
          onChange={(e) => setForm({ ...form, googleMapUrl: e.target.value })}
          type="url"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="resize-none h-20"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Why should this be added?</Label>
        <Textarea
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className="resize-none h-16"
        />
      </div>
      {/* Images */}
      <div className="space-y-1.5">
        <Label className="text-xs">Photos ({form.images.length}/3)</Label>
        <div className="flex gap-2 flex-wrap">
          {form.images.map((img, i) => (
            <div
              key={i}
              className="relative h-16 w-16 rounded-md overflow-hidden border group"
            >
              <Image src={img} alt="" fill className="object-cover" />
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    images: form.images.filter((_, j) => j !== i),
                  })
                }
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ))}
          {form.images.length < 3 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-16 w-16 rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => updateMutation.mutate(form)}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 size={14} className="animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function RequestPlacePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);

  const [form, setForm] = useState({
    nameEn: "",
    nameKh: "",
    province: "",
    category: "",
    googleMapUrl: "",
    description: "",
    reason: "",
    images: [] as string[],
  });

  // Fetch user's own requests
  const { data: myRequests = [], isLoading: loadingRequests } = useQuery<any[]>(
    {
      queryKey: ["my-requests"],
      queryFn: async () => {
        const res = await fetch("/api/requests");
        if (!res.ok) return [];
        return res.json();
      },
      enabled: !!session,
    },
  );

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/admin/requests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request submitted! We'll review it soon.");
      setForm({
        nameEn: "",
        nameKh: "",
        province: "",
        category: "",
        googleMapUrl: "",
        description: "",
        reason: "",
        images: [],
      });
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
    onError: () => toast.error("Failed to submit request"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel");
    },
    onSuccess: () => {
      toast.success("Request cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    const data = new FormData();
    data.append("file", files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setForm((prev) => ({ ...prev, images: [...prev.images, result.url] }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!form.province || !form.category) {
      toast.error("Please select province and category");
      return;
    }
    submitMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-12 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Map
        </Link>

        {/* Submit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Suggest a Place</CardTitle>
            <CardDescription>
              Help us grow the map! Tell us about a hidden gem in Cambodia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nameEn">Place Name (English) *</Label>
                  <Input
                    id="nameEn"
                    value={form.nameEn}
                    onChange={(e) =>
                      setForm({ ...form, nameEn: e.target.value })
                    }
                    placeholder="e.g. Koh Ker"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nameKh">Place Name (Khmer)</Label>
                  <Input
                    id="nameKh"
                    value={form.nameKh}
                    onChange={(e) =>
                      setForm({ ...form, nameKh: e.target.value })
                    }
                    placeholder="e.g. កោះកេរ្ដិ៍"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Province *</Label>
                  <Select
                    value={form.province}
                    onValueChange={(v) => setForm({ ...form, province: v })}
                  >
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
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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

              <div className="space-y-1.5">
                <Label htmlFor="googleMapUrl">Google Maps Link *</Label>
                <Input
                  id="googleMapUrl"
                  value={form.googleMapUrl}
                  onChange={(e) =>
                    setForm({ ...form, googleMapUrl: e.target.value })
                  }
                  type="url"
                  placeholder="https://maps.google.com/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Used to verify exact coordinates.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Tell us what makes this place special..."
                  className="resize-none min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Photos (up to 3)</Label>
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative h-20 w-20 rounded-md overflow-hidden border group"
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            images: form.images.filter((_, j) => j !== i),
                          })
                        }
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {form.images.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-20 w-20 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted transition-colors"
                    >
                      {isUploading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <ImagePlus size={18} />
                      )}
                      <span className="text-[10px]">Add photo</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Why should this be added? *</Label>
                <Textarea
                  id="reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. It's a newly discovered waterfall..."
                  className="resize-none min-h-[80px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Submissions */}
        {session && (
          <Card>
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>
                Track the status of your place suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={24}
                    className="animate-spin text-muted-foreground"
                  />
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((req) => {
                    const config =
                      STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] ||
                      STATUS_CONFIG.PENDING;
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={req.id}
                        className="flex gap-4 p-4 rounded-lg border bg-card"
                      >
                        {/* Image preview */}
                        {req.images?.[0] ? (
                          <div className="relative h-16 w-20 rounded-md overflow-hidden border shrink-0">
                            <Image
                              src={req.images[0]}
                              alt={req.nameEn}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-20 rounded-md border bg-muted flex items-center justify-center shrink-0">
                            <ImageIcon
                              size={20}
                              className="text-muted-foreground"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm">
                                {req.nameEn}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {req.province} · {req.category}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] shrink-0 flex items-center gap-1",
                                config.className,
                              )}
                            >
                              <StatusIcon size={10} />
                              {config.label}
                            </Badge>
                          </div>

                          {req.adminNote && (
                            <p className="text-xs text-muted-foreground mt-1.5 bg-muted rounded px-2 py-1">
                              <span className="font-semibold">Admin note:</span>{" "}
                              {req.adminNote}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted{" "}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {req.status === "PENDING" && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <Dialog
                              open={editingRequest?.id === req.id}
                              onOpenChange={(open) =>
                                !open && setEditingRequest(null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingRequest(req)}
                                >
                                  <Pencil size={13} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Submission</DialogTitle>
                                  <DialogDescription>
                                    Update your pending request before it's
                                    reviewed.
                                  </DialogDescription>
                                </DialogHeader>
                                {editingRequest && (
                                  <EditRequestDialog
                                    request={editingRequest}
                                    onClose={() => setEditingRequest(null)}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel this request?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete your submission
                                    for <strong>{req.nameEn}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      cancelMutation.mutate(req.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Request
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
