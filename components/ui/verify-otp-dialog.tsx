"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Mail } from "lucide-react";

interface VerifyOtpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function VerifyOtpDialog({
  isOpen,
  onClose,
  onVerified,
}: VerifyOtpDialogProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sentRef = useRef(false);

  const sendOtp = async () => {
    if (sentRef.current) return;
    sentRef.current = true;
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/users/otp");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      toast.success("Verification code sent to webmaster");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      sentRef.current = false;
      sendOtp();
      setOtp("");
    }
  }, [isOpen]);

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      toast.error("Please enter a 4-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users/otp", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      onVerified();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] border-none bg-zinc-950 dark text-white p-6 shadow-2xl">
        <DialogHeader className="items-center text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Security Verification
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            A 4-digit verification code was sent to the webmaster. Please enter
            it below to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-4">
          <Input
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            className="text-center text-3xl font-bold tracking-[1em] h-16 w-full bg-zinc-900 border-zinc-800 placeholder:text-zinc-800 focus-visible:ring-primary h-20"
            disabled={isLoading}
          />
          <Button
            variant="link"
            size="sm"
            onClick={sendOtp}
            disabled={isSending || isLoading}
            className="text-primary hover:text-primary/80"
          >
            {isSending ? (
              <Loader2 className="animate-spin h-3 w-3 mr-2" />
            ) : (
              <Mail className="h-3 w-3 mr-2" />
            )}
            Resend Code
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 border-none"
          >
            Cancel
          </Button>
          <Button
            onClick={verifyOtp}
            disabled={isLoading || otp.length !== 4}
            className="bg-primary text-primary-foreground font-bold flex-1"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : null}
            Verify & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
