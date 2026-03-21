"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, updateUser } from "@/lib/auth-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWebHaptics } from "web-haptics/react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: session } = useSession();
  const { trigger } = useWebHaptics();
  const [activeTab, setActiveTab] = useState("settings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery<any[]>(
    {
      queryKey: ["user-requests"],
      queryFn: async () => {
        const res = await fetch("/api/user/requests");
        if (!res.ok) return [];
        return res.json();
      },
      enabled: !!session && open && activeTab === "contributions",
    },
  );

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

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

      setImage(result.url);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUser({
        name,
        image,
      });
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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-3xl">
        <div className="bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="relative group cursor-pointer mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl transition-transform group-hover:scale-105">
                <AvatarImage src={image} />
                <AvatarFallback className="bg-white/20 text-3xl font-extrabold text-white">
                  {name[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="text-white animate-spin" size={24} />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>
            <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
            <DialogDescription className="text-primary-foreground/70 font-medium text-center">
              Manage your personal information
            </DialogDescription>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            trigger(10);
            setActiveTab(v);
          }}
          className="w-full"
        >
          <div className="px-8 mt-4">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1">
              <TabsTrigger
                value="settings"
                className="rounded-xl flex items-center gap-2 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
              >
                <Settings size={14} />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="contributions"
                className="rounded-xl flex items-center gap-2 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
              >
                <History size={14} />
                Contributions
                {requests.length > 0 && (
                  <span className="ml-0.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {requests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[60vh] mt-2">
            <TabsContent value="settings" className="mt-0 outline-none">
              <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Display Name</Label>
                    <div className="relative">
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 ring-primary/50 shadow-none"
                        placeholder="Your name"
                        required
                      />
                      <User
                        className="absolute left-3 top-3.5 text-zinc-400"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="profile-email"
                        value={session.user.email}
                        className="pl-9 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                        readOnly
                      />
                      <Mail
                        className="absolute left-3 top-3.5 text-zinc-400"
                        size={16}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Email cannot be changed manually.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 mb-1">
                        <Shield size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Role
                        </span>
                      </div>
                      <p className="font-bold text-sm text-primary uppercase">
                        {(session.user as any).role || "USER"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400 mb-1">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Joined
                        </span>
                      </div>
                      <p className="font-bold text-sm">
                        {new Date(session.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="contributions" className="mt-0 outline-none">
              <div className="p-8 space-y-4">
                {isLoadingRequests ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      fetching history...
                    </p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-400 text-center gap-3">
                    <History size={32} strokeWidth={1.5} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                        No contributions yet
                      </p>
                      <p className="text-xs">
                        Suggest a hidden gem to start your list!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-primary/50 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                              {request.nameEn}
                              {request.status === "APPROVED" && (
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-500"
                                />
                              )}
                              {request.status === "REJECTED" && (
                                <XCircle size={14} className="text-rose-500" />
                              )}
                              {request.status === "PENDING" && (
                                <Clock size={14} className="text-amber-500" />
                              )}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {request.province}
                              </span>
                              <span className="text-zinc-300 dark:text-zinc-700">
                                •
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {request.category}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-0",
                              request.status === "APPROVED" &&
                                "bg-emerald-500/10 text-emerald-500",
                              request.status === "REJECTED" &&
                                "bg-rose-500/10 text-rose-500",
                              request.status === "PENDING" &&
                                "bg-amber-500/10 text-amber-500",
                            )}
                          >
                            {request.status}
                          </Badge>
                        </div>

                        {request.adminNote && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 mt-1">
                            <MessageSquare
                              size={12}
                              className="text-zinc-400 mt-0.5"
                            />
                            <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex-1 italic italic-medium">
                              "{request.adminNote}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                          <span className="text-[10px] text-zinc-400 font-medium">
                            Submitted{" "}
                            {formatDistanceToNow(new Date(request.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Request <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
