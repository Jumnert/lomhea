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
  Trash2,
  Loader2,
  MapPin,
  ShieldCheck,
  ShieldAlert,
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
import Image from "next/image";

import { useSession } from "@/lib/auth-client";

export default function AdminPlacesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: places = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-places"],
    queryFn: async () => {
      const res = await fetch("/api/places");
      if (!res.ok) throw new Error("Failed to fetch places");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
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
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin mb-4 text-zinc-400" size={32} />
        <p className="font-black uppercase tracking-widest text-xs text-zinc-500">
          Loading Directory...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase tracking-wide">
              Locations
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Verify and monitor geographic data.
            </p>
          </div>
          <AddPlaceDialog />
        </div>

        <Card className="border-border shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-3 px-8 pt-8">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <MapPin size={18} className="text-zinc-900" />
              Directory Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent px-8">
                  <TableHead className="px-8 font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Place
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Category
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Province
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Status
                  </TableHead>
                  <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {places.map((place) => (
                  <TableRow
                    key={place.id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-20 rounded-2xl overflow-hidden border border-zinc-100 bg-white shadow-sm ring-4 ring-zinc-50 shrink-0 transform group-hover:scale-105 transition-transform duration-200">
                          {place.images?.[0] ? (
                            <Image
                              src={place.images[0]}
                              alt={place.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <MapPin size={18} className="text-zinc-200" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight text-zinc-900 group-hover:text-primary transition-colors">
                            {place.name}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-bold font-kantumruy leading-none mt-1">
                            {place.nameKh || "No Khmer Name"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-zinc-900 text-white shadow-lg shadow-zinc-200">
                        {place.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-black text-zinc-600 uppercase tracking-tighter">
                      {place.province}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          verifyMutation.mutate({
                            id: place.id,
                            isVerified: !place.isVerified,
                          })
                        }
                        className={`group/status flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          place.isVerified
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {place.isVerified ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <ShieldAlert size={12} />
                        )}
                        {place.isVerified ? "Verified" : "Pending"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex items-center justify-end gap-2">
                        <EditPlaceDialog place={place} />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-none shadow-3xl p-8">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase tracking-wide">
                                Are you sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="font-medium text-zinc-500 text-base mt-2">
                                You are about to permanently delete{" "}
                                <span className="font-bold text-zinc-900">
                                  {place.name}
                                </span>
                                . This location and its associated metadata will
                                be erased forever.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-3">
                              <AlertDialogCancel className="h-12 rounded-2xl font-black uppercase tracking-widest border-2">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(place.id)}
                                className="h-12 rounded-2xl font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white border-none shadow-lg shadow-rose-100"
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
      </div>
    </div>
  );
}
