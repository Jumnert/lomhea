"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type PaymentStatus = "idle" | "pending" | "paid";

interface BakongPaymentDialogProps {
  placeId: string;
  placeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BakongPaymentDialog({
  placeId,
  placeName,
  isOpen,
  onClose,
}: BakongPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [countdown, setCountdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [featuredCommitted, setFeaturedCommitted] = useState(false);
  const priceUsd = Number(process.env.NEXT_PUBLIC_FEATURED_PRICE_USD || 5);

  const reset = () => {
    setQrData(null);
    setPaymentStatus("idle");
    setCountdown(null);
    setError(null);
    setLoading(false);
    setFeaturedCommitted(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen]);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    setPaymentStatus("idle");
    try {
      const res = await fetch("/api/bakong/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, amount: priceUsd }),
      });
      const data = await res.json();
      if (!res.ok || !data?.md5 || !data?.qrString) {
        throw new Error(data?.error || "Failed to generate QR");
      }
      setQrData({
        id: data.placeId,
        amount: data.amount,
        currency: data.currency || "USD",
        qr_code: data.qrString,
        qr_md5: data.md5,
        qr_expiration: data.expiresAt,
        merchant_name: process.env.NEXT_PUBLIC_MERCHANT_NAME || "Lomhea",
      });
      setPaymentStatus("pending");
    } catch (e: any) {
      setError(e?.message || "Could not start Bakong payment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentStatus !== "pending" || !qrData?.qr_md5) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/bakong/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ md5: qrData.qr_md5 }),
        });
        const data = await res.json();
        if (!res.ok) return;
        if (data.status === "SUCCESS") {
          setPaymentStatus("paid");
          clearInterval(interval);
        }
      } catch {
        // keep polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [paymentStatus, qrData]);

  useEffect(() => {
    if (paymentStatus !== "paid" || featuredCommitted || !qrData?.qr_md5) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/places/${placeId}/feature`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ md5: qrData.qr_md5 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Promote failed");
        if (cancelled) return;
        setFeaturedCommitted(true);
        toast.success("Place promoted successfully.");
        queryClient.invalidateQueries({ queryKey: ["places"] });
        queryClient.invalidateQueries({ queryKey: ["place", placeId] });
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to promote place.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [featuredCommitted, paymentStatus, placeId, qrData, queryClient]);

  useEffect(() => {
    if (!qrData?.qr_expiration || paymentStatus !== "pending") return;

    const updateCountdown = () => {
      const now = Date.now();
      const expirationTime = new Date(qrData.qr_expiration).getTime();
      const remaining = expirationTime - now;
      if (remaining <= 0) {
        setCountdown("00:00");
        setError("QR code expired. Please generate a new one.");
        setPaymentStatus("idle");
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [qrData, paymentStatus]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Promote {placeName}
          </DialogTitle>
          <DialogDescription className="text-center">
            Bakong KHQR payment
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {paymentStatus === "idle" && (
          <Button
            onClick={generateQRCode}
            disabled={loading}
            className="w-full h-11"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Promote and Generate QR"
            )}
          </Button>
        )}

        {paymentStatus === "pending" && qrData && (
          <div className="space-y-4">
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/40 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Merchant</span>
                <span>{qrData.merchant_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount</span>
                <span>
                  ${qrData.amount} {qrData.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expires in</span>
                <span className="font-semibold text-orange-500">
                  {countdown || "Loading..."}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="border rounded-lg p-3 bg-white">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrData.qr_code)}`}
                  alt="Bakong KHQR"
                  width={280}
                  height={280}
                />
              </div>
            </div>

            <p className="text-xs text-center text-zinc-500">
              Auto-checking payment status...
            </p>

            <Button variant="secondary" onClick={reset} className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {paymentStatus === "paid" && (
          <div className="text-center space-y-4 py-2">
            <div className="text-5xl text-green-500">✓</div>
            <h3 className="text-lg font-bold text-green-600">Payment Successful</h3>
            <p className="text-sm text-zinc-500">
              Your place has been promoted.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

