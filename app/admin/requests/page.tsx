"use client";

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
  Inbox,
  Loader2,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  User as UserIcon,
  MapPin,
  Eye,
  Calendar,
  Globe,
  Tag,
  AlignLeft,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/requests");
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/requests/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve request");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request approved and place created!");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
      setSelectedRequest(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject request");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["places"] });
      setRejectReason("");
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
        <p className="text-sm text-muted-foreground text-center">
          Syncing Community Data...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Validate and monitor geographical suggestions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Inbox size={18} />
            Incoming Requests Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] pl-6">Contributor</TableHead>
                <TableHead>Place Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground font-medium"
                  >
                    Queue is currently empty.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              request.user.image ||
                              `https://avatar.vercel.sh/${request.user.name}`
                            }
                          />
                          <AvatarFallback>
                            {request.user.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">
                            {request.user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                          {request.nameEn}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={12} /> {request.province}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "PENDING"
                            ? "outline"
                            : request.status === "APPROVED"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Dialog
                        open={selectedRequest?.id === request.id}
                        onOpenChange={(o) => {
                          if (!o) {
                            setSelectedRequest(null);
                            setIsRejectDialogOpen(false);
                            setRejectReason("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye size={14} className="mr-2" /> Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-zinc-800/50">
                          <DialogHeader className="p-4 sm:p-6 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-medium"
                              >
                                Request ID: {request.id.slice(-6)}
                              </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                              {request.nameEn}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground leading-tight">
                              {request.nameKh || "Name in Khmer Missing"}
                            </DialogDescription>
                          </DialogHeader>

                          <ScrollArea className="max-h-[70vh]">
                            <div className="p-4 sm:p-6 space-y-4">
                              {/* Metadata Cards */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Category
                                  </label>
                                  <p className="text-sm font-medium">
                                    {request.category}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Province
                                  </label>
                                  <p className="text-sm font-medium">
                                    {request.province}
                                  </p>
                                </div>
                              </div>

                              {/* Link */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Official Location
                                </label>
                                <a
                                  href={request.googleMapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                                >
                                  <div className="flex items-center gap-2 text-sm font-medium truncate max-w-[400px]">
                                    <MapPin
                                      size={16}
                                      className="text-primary"
                                    />
                                    {request.googleMapUrl}
                                  </div>
                                  <ExternalLink
                                    size={14}
                                    className="text-muted-foreground"
                                  />
                                </a>
                              </div>

                              {/* Images */}
                              <div className="space-y-3">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Gallery Evidence (
                                  {request.images?.length || 0})
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {request.images?.map(
                                    (img: string, i: number) => (
                                      <div
                                        key={i}
                                        className="relative aspect-video rounded bg-muted overflow-hidden"
                                      >
                                        <Image
                                          src={img}
                                          alt="Evidence"
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ),
                                  )}
                                  {(!request.images ||
                                    request.images.length === 0) && (
                                    <div className="col-span-3 text-center py-8 border-dashed rounded text-sm text-muted-foreground">
                                      No photos provided
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Description
                                </label>
                                <div className="p-4 rounded-md text-sm text-muted-foreground leading-relaxed bg-muted/20">
                                  {request.description}
                                </div>
                              </div>

                              {/* Reason */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Submitter's Rationale
                                </label>
                                <div className="p-4 rounded-md bg-muted/50 italic text-sm text-muted-foreground">
                                  "{request.reason || "No reason provided."}"
                                </div>
                              </div>

                              {/* Session Context */}
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={request.user.image} />
                                    <AvatarFallback>
                                      {request.user.name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>Suggested by {request.user.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </ScrollArea>

                          {request.status === "PENDING" && (
                            <DialogFooter className="p-6 bg-muted/20 flex-row gap-2">
                              <Dialog
                                open={isRejectDialogOpen}
                                onOpenChange={setIsRejectDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="flex-1">
                                    <X
                                      size={16}
                                      className="mr-2 text-destructive"
                                    />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rejection Reason</DialogTitle>
                                    <DialogDescription>
                                      Provide an explanation for the user on why
                                      this suggestion was turned down.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                      setRejectReason(e.target.value)
                                    }
                                    className="min-h-[100px]"
                                    placeholder="Duplicate entry or location is outside Cambodia boundaries..."
                                  />
                                  <DialogFooter>
                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        setIsRejectDialogOpen(false)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        rejectMutation.mutate({
                                          id: request.id,
                                          reason: rejectReason,
                                        })
                                      }
                                      disabled={
                                        !rejectReason ||
                                        rejectMutation.isPending
                                      }
                                    >
                                      {rejectMutation.isPending ? (
                                        <Loader2
                                          size={16}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        "Confirm Rejection"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                className="flex-1"
                                onClick={() =>
                                  approveMutation.mutate(request.id)
                                }
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <>
                                    <Check size={16} className="mr-2" />
                                    Approve & Publish
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
