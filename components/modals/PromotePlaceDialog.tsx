"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  QrCode,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PromotePlaceDialogProps {
  placeId: string;
  placeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PromotePlaceDialog({
  placeId,
  placeName,
  isOpen,
  onClose,
}: PromotePlaceDialogProps) {
  const [status, setStatus] = useState<
    "IDLE" | "POLLING" | "SUCCESS" | "ERROR"
  >("IDLE");
  const [md5, setMd5] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Price for promotion (Could be configurable)
  const PREMIUM_PRICE = 5.0; // $5 USD

  const initiatePromotion = async () => {
    setStatus("POLLING");
    try {
      // In a real app, you'd call a Bakong SDK or API to get a dynamic QR
      // For now, we simulate the 'MD5' hash that will be tracked.
      // THE USER's BAKONG_ACCOUNT_ID should be used.
      const res = await fetch("/api/bakong/initiate", {
        method: "POST",
        body: JSON.stringify({ placeId, amount: PREMIUM_PRICE }),
      });
      const data = await res.json();

      if (data.qrString && data.md5) {
        setQrString(data.qrString);
        setMd5(data.md5);
      }
    } catch (error) {
      toast.error("Failed to initialize payment");
      setStatus("ERROR");
    }
  };

  useEffect(() => {
    if (isOpen) {
      initiatePromotion();
    } else {
      setStatus("IDLE");
      setQrString(null);
      setMd5(null);
    }
  }, [isOpen]);

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "POLLING" && md5) {
      interval = setInterval(async () => {
        try {
          const checkRes = await fetch("/api/bakong/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ md5 }),
          });
          const checkData = await checkRes.json();
          if (!checkRes.ok || checkData.status !== "SUCCESS") {
            return;
          }

          const featureRes = await fetch(`/api/places/${placeId}/feature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ md5 }),
          });
          const featureData = await featureRes.json();
          if (featureRes.ok && featureData.success) {
            setStatus("SUCCESS");
            clearInterval(interval);
            toast.success("Payment Received! Place is now Featured.");
            queryClient.invalidateQueries({ queryKey: ["places"] });
            queryClient.invalidateQueries({ queryKey: ["place", placeId] });

            // Auto close after 3 seconds of showing success
            setTimeout(onClose, 3000);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => clearInterval(interval);
  }, [status, md5, placeId, queryClient, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-950 border-none text-white rounded-[32px] overflow-hidden p-0 shadow-2xl">
        {/* Animated Background Gradeint */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />

        <div className="relative p-8 flex flex-col items-center text-center">
          <div className="mb-6 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5 animate-pulse">
            <TrendingUp size={24} />
          </div>

          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Promote <span className="text-primary italic">{placeName}</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium px-4">
              Highlight this destination for 30 days on the map and sidebar. 🌟
            </DialogDescription>
          </DialogHeader>

          {status === "SUCCESS" ? (
            <div className="py-12 flex flex-col items-center animate-in zoom-in duration-500">
              <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-bold mb-2">Transaction Confirmed!</h3>
              <p className="text-zinc-500 text-sm">
                Welcome to the Premium Highlights Sidebar.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-8">
              {/* QR Code Container */}
              <div className="relative mx-auto w-64 h-64 bg-white rounded-[24px] p-6 shadow-2xl flex items-center justify-center group overflow-hidden border-4 border-zinc-900">
                {qrString ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`}
                    alt="Bakong payment QR"
                    width={200}
                    height={200}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-zinc-200" />
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      Generating QR...
                    </span>
                  </div>
                )}

                {/* Visual Scan Guides */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/40" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/40" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 text-zinc-300 text-sm font-bold bg-zinc-900/50 py-3 px-6 rounded-2xl border border-zinc-800">
                  <Sparkles className="text-amber-500" size={16} />
                  Total Investment:{" "}
                  <span className="text-white">
                    ${PREMIUM_PRICE.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/30 p-2 rounded-xl border border-dashed border-zinc-800">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Secured by Bakong Open API
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    How it works
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed px-6">
                  Open your <strong>Bakong App</strong>, scan this QR, and
                  confirm payment. The highlight will activate instantly upon
                  verification.
                </p>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all rounded-2xl h-12"
                >
                  Cancel Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
