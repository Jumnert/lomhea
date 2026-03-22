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
import { Badge } from "@/components/ui/badge";
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
      queryClient.invalidateQueries({ queryKey: ["places"] });
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
        <AddPlaceDialog />
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
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="pl-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 rounded border bg-muted overflow-hidden shrink-0">
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
    </div>
  );
}
