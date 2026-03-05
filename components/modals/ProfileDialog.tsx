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

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

        <ScrollArea className="max-h-[60vh]">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
