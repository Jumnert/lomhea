"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Camera,
  CheckCircle2,
  Clock,
  ImageIcon,
  Loader2,
  Mail,
  MessageSquare,
  Save,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useWebHaptics } from "web-haptics/react";

import { useSession, updateUser } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: session } = useSession();
  const { trigger } = useWebHaptics();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery<any[]>({
    queryKey: ["user-requests"],
    queryFn: async () => {
      const res = await fetch("/api/user/requests");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session && open && activeTab === "contributions",
  });

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
      setCoverImage((session.user as any).coverImage || "");
    }
  }, [session]);

  const uploadImage = async (
    file: File,
    onSuccess: (url: string) => void,
    successMessage: string,
  ) => {
    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      onSuccess(result.url);
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    await uploadImage(files[0], setImage, "Profile photo uploaded successfully");
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    await uploadImage(files[0], setCoverImage, "Cover photo uploaded successfully");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUser({ name, image, coverImage } as any);
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl border bg-background p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Manage your profile and contributions.</DialogDescription>
        </DialogHeader>

        <div
          className="border-b px-4 pb-4 pt-4 text-foreground sm:px-6 sm:pb-5 sm:pt-5"
          style={{
            backgroundImage: coverImage
              ? `linear-gradient(rgba(15, 23, 42, 0.32), rgba(15, 23, 42, 0.4)), url(${coverImage})`
              : "linear-gradient(135deg, #032ea1 0%, #0d47c8 54%, #e00025 100%)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-md border border-border bg-background text-foreground shadow-none hover:bg-accent"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                Cover
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadCover}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div
                className="group relative mx-auto cursor-pointer sm:mx-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="h-16 w-16 shadow-xl sm:h-20 sm:w-20">
                  <AvatarImage src={image} />
                  <AvatarFallback className="bg-muted text-2xl font-bold text-foreground">
                    {name[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                  ) : (
                    <Camera className="h-5 w-5 text-foreground" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadAvatar}
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge
                    variant="secondary"
                    className="rounded-md border border-border bg-background text-foreground hover:bg-accent"
                  >
                    Profile
                  </Badge>
                </div>
                <div>
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    {name || "Unnamed User"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Keep your account details up to date and track your place
                    submissions in one spot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            trigger(10);
            setActiveTab(value);
          }}
          className="w-full"
        >
          <div className="px-4 pt-4 sm:px-6">
            <TabsList className="grid w-full grid-cols-2 rounded-lg p-1">
              <TabsTrigger value="profile" className="rounded-md">
                Profile
              </TabsTrigger>
              <TabsTrigger value="contributions" className="rounded-md">
                Contributions
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[68vh]">
            <TabsContent value="profile" className="mt-0 outline-none">
              <div className="p-4 sm:p-6">
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="space-y-1.5">
                    <CardTitle className="text-xl">Profile settings</CardTitle>
                    <CardDescription>
                      Update the details other people see across Lomhea.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profile-name">Display name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="profile-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="h-11 rounded-lg pl-9"
                              placeholder="Your name"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profile-email">Email address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="profile-email"
                              value={session.user.email}
                              className="h-11 rounded-lg pl-9"
                              readOnly
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Email changes are not available from this dialog.
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => onOpenChange(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="rounded-lg"
                          disabled={isSubmitting || isUploading}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save profile
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="mt-0 outline-none">
              <div className="p-4 sm:p-6">
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="space-y-1.5">
                    <CardTitle className="text-xl">Contribution history</CardTitle>
                    <CardDescription>
                      Review the places you have submitted and their moderation
                      status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRequests ? (
                      <div className="flex min-h-48 flex-col items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Loading contribution history...
                        </p>
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">No contributions yet</p>
                          <p className="text-sm text-muted-foreground">
                            Suggest a place to start building your contribution
                            history.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {requests.map((request) => (
                          <div
                            key={request.id}
                            className="rounded-xl border bg-card p-4 shadow-sm"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-semibold">
                                    {request.nameEn}
                                  </h4>
                                  {request.status === "APPROVED" ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  ) : null}
                                  {request.status === "REJECTED" ? (
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                  ) : null}
                                  {request.status === "PENDING" ? (
                                    <Clock className="h-4 w-4 text-amber-500" />
                                  ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                  <span>{request.province}</span>
                                  <span>•</span>
                                  <span>{request.category}</span>
                                </div>
                              </div>

                              <Badge
                                variant="secondary"
                                className={cn(
                                  "rounded-md px-3 py-1",
                                  request.status === "APPROVED" &&
                                    "bg-emerald-500/10 text-emerald-600",
                                  request.status === "REJECTED" &&
                                    "bg-rose-500/10 text-rose-600",
                                  request.status === "PENDING" &&
                                    "bg-amber-500/10 text-amber-600",
                                )}
                              >
                                {request.status}
                              </Badge>
                            </div>

                            {request.adminNote ? (
                              <div className="mt-4 rounded-lg border bg-muted/40 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                  Admin note
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                  {request.adminNote}
                                </p>
                              </div>
                            ) : null}

                            <Separator className="my-4" />

                            <p className="text-xs text-muted-foreground">
                              Submitted{" "}
                              {formatDistanceToNow(new Date(request.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
