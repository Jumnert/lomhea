"use client";

import { AddPlaceDialog } from "@/components/ui/add-place-dialog";
import { EditPlaceDialog } from "@/components/ui/edit-place-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Loader2,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  StarOff,
  AlertTriangle,
} from "lucide-react";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";

import { useSession } from "@/lib/auth-client";
import { VerifyOtpDialog } from "@/components/ui/verify-otp-dialog";

export default function AdminPlacesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState<{
    id: string;
    name: string;
    isFeatured: boolean;
  } | null>(null);

  const { data: places = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-places"],
    queryFn: async () => {
      const res = await fetch("/api/admin/places");
      if (!res.ok) throw new Error("Failed to fetch places");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      id,
      isVerified,
    }: {
      id: string;
      isVerified: boolean;
    }) => {
      const res = await fetch(`/api/places/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Place status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  const requestHighlightAction = (place: any) => {
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN") {
      toast.error("Only ADMIN can highlight/unhighlight places.");
      return;
    }

    setPendingHighlight({
      id: place.id,
      name: place.name,
      isFeatured: Boolean(place.isFeatured),
    });
    setIsVerifyOpen(true);
  };

  const highlightMutation = useMutation({
    mutationFn: async ({
      id,
      highlight,
    }: {
      id: string;
      highlight: boolean;
    }) => {
      const role = (session?.user as any)?.role;
      if (role !== "ADMIN") {
        throw new Error(
          "Only ADMIN can highlight/unhighlight places without payment.",
        );
      }

      const res = await fetch(`/api/admin/places/${id}/highlight`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlight, durationDays: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update highlight.");
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.highlight
          ? "Place highlighted by admin."
          : "Place unhighlighted by admin.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const userRole = (session?.user as any)?.role;
      if (userRole === "MODERATOR") {
        throw new Error(
          "You do not have authorization to remove locations. Please contact an Admin.",
        );
      }

      const res = await fetch(`/api/places/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete place");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Place deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
        <p className="text-sm text-muted-foreground">Loading Directory...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
          <p className="text-sm text-muted-foreground">
            Verify and monitor geographic data.
          </p>
        </div>
        <AddPlaceDialog
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add New Place
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin size={18} />
            Directory Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px] pl-6">Place</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Highlight</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="pl-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 rounded bg-muted overflow-hidden shrink-0">
                        {place.images?.[0] ? (
                          <Image
                            src={place.images[0]}
                            alt={place.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <MapPin
                              size={16}
                              className="text-muted-foreground"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">
                          {place.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {place.nameKh || "No Khmer Name"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{place.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{place.province}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        verifyMutation.mutate({
                          id: place.id,
                          isVerified: !place.isVerified,
                        })
                      }
                      className="h-8 px-2 gap-2"
                    >
                      <Badge variant={place.isVerified ? "default" : "outline"}>
                        {place.isVerified ? (
                          <ShieldCheck size={12} className="mr-1" />
                        ) : (
                          <ShieldAlert size={12} className="mr-1" />
                        )}
                        {place.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={place.isFeatured ? "default" : "outline"}
                        className={
                          place.isFeatured
                            ? "bg-amber-500 hover:bg-amber-500 text-zinc-950"
                            : ""
                        }
                      >
                        {place.isFeatured ? (
                          <Sparkles size={12} className="mr-1" />
                        ) : (
                          <StarOff size={12} className="mr-1" />
                        )}
                        {place.isFeatured ? "Highlighted" : "Normal"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestHighlightAction(place)}
                        disabled={highlightMutation.isPending}
                      >
                        {place.isFeatured ? "Unhighlight" : "Highlight"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <EditPlaceDialog place={place} />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to permanently delete{" "}
                              <span className="font-semibold text-foreground">
                                {place.name}
                              </span>
                              . This location and its associated metadata will
                              be erased forever.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(place.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Location
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <VerifyOtpDialog
        isOpen={isVerifyOpen}
        onClose={() => {
          setIsVerifyOpen(false);
          setPendingHighlight(null);
        }}
        onVerified={() => {
          setIsVerifyOpen(false);
          setIsConfirmOpen(true);
        }}
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-[420px]">
          <AlertDialogHeader>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Absolute Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingHighlight?.isFeatured
                ? `You are about to unhighlight "${pendingHighlight?.name}". Are you sure?`
                : `You are about to highlight "${pendingHighlight?.name}" for 30 days without payment. Are you sure?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setPendingHighlight(null);
              }}
            >
              Abort Action
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                pendingHighlight?.isFeatured
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
              }
              onClick={() => {
                if (!pendingHighlight) return;
                highlightMutation.mutate({
                  id: pendingHighlight.id,
                  highlight: !pendingHighlight.isFeatured,
                });
                setPendingHighlight(null);
              }}
            >
              Yes, Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
