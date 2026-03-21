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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin mb-4 text-zinc-400" size={32} />
        <p className="font-black uppercase tracking-widest text-xs text-zinc-500 text-center">
          Syncing Community Data...
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
              Submissions
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Validate and monitor geographical suggestions.
            </p>
          </div>
        </div>

        <Card className="border-border shadow-2xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-3 px-8 pt-8">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Inbox size={18} className="text-zinc-900" />
              Incoming Requests Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent px-8">
                  <TableHead className="px-8 font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Contributor
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Place Info
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Status
                  </TableHead>
                  <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[10px] text-zinc-400">
                    Review
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-48 text-center text-zinc-400 font-medium"
                    >
                      Queue is currently empty.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="group hover:bg-zinc-50/50 transition-colors"
                    >
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              request.user.image ||
                              `https://avatar.vercel.sh/${request.user.name}`
                            }
                            alt={request.user.name}
                            width={32}
                            height={32}
                            className="rounded-full border border-zinc-100"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight text-zinc-900">
                              {request.user.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter leading-none mt-1">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-zinc-900">
                            {request.nameEn}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                            <MapPin size={10} /> {request.province}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                            request.status === "PENDING"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : request.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}
                        >
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-8">
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
                              variant="ghost"
                              className="font-black uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm border border-transparent hover:border-zinc-900"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye size={14} className="mr-2" /> Review
                              Suggestion
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none rounded-3xl shadow-3xl">
                            <div className="bg-zinc-900 p-8 text-white relative flex flex-col items-center justify-center overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                              <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                                <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase mb-2">
                                  Request ID: {request.id.slice(-6)}
                                </Badge>
                                <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                                  {request.nameEn}
                                </DialogTitle>
                                <DialogDescription className="text-zinc-400 font-kantumruy font-bold text-lg">
                                  {request.nameKh || "Name in Khmer Missing"}
                                </DialogDescription>
                              </div>
                            </div>

                            <ScrollArea className="max-h-[70vh]">
                              <div className="p-8 space-y-8">
                                {/* Metadata Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                      <Tag size={12} /> Category
                                    </div>
                                    <p className="font-bold text-zinc-800">
                                      {request.category}
                                    </p>
                                  </div>
                                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                      <MapPin size={12} /> Province
                                    </div>
                                    <p className="font-bold text-zinc-800">
                                      {request.province}
                                    </p>
                                  </div>
                                </div>

                                {/* Link */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    <Globe size={14} /> Official Location
                                  </div>
                                  <a
                                    href={request.googleMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <MapPin
                                        size={20}
                                        className="text-primary"
                                      />
                                      <span className="font-bold text-sm truncate max-w-[300px]">
                                        {request.googleMapUrl}
                                      </span>
                                    </div>
                                    <ExternalLink
                                      size={16}
                                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                                    />
                                  </a>
                                </div>

                                {/* Images */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    <ImageIcon size={14} /> Gallery Evidence (
                                    {request.images?.length || 0})
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    {request.images?.map(
                                      (img: string, i: number) => (
                                        <div
                                          key={i}
                                          className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-100 shadow-sm ring-4 ring-zinc-50 transition-transform hover:scale-105 cursor-zoom-in"
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
                                      <div className="col-span-3 text-center p-8 border-2 border-dashed rounded-2xl text-zinc-300 font-bold uppercase tracking-widest text-xs">
                                        No photos provided
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    <AlignLeft size={14} /> Description Content
                                  </div>
                                  <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-inner">
                                    <p className="text-zinc-600 font-medium leading-relaxed">
                                      {request.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                    <MessageSquare size={14} /> Submitter's
                                    Rationale
                                  </div>
                                  <div className="p-5 rounded-2xl bg-black/5 border border-zinc-100 italic">
                                    <p className="text-zinc-500 font-medium leading-relaxed">
                                      "{request.reason || "No reason provided."}
                                      "
                                    </p>
                                  </div>
                                </div>

                                {/* Session Context */}
                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                  <div className="flex items-center gap-3">
                                    <Image
                                      src={
                                        request.user.image ||
                                        `https://avatar.vercel.sh/${request.user.name}`
                                      }
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                      alt="X"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                      Suggested by {request.user.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <Calendar size={12} />{" "}
                                    {new Date(
                                      request.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>

                            {request.status === "PENDING" && (
                              <DialogFooter className="p-8 bg-zinc-50 border-t border-zinc-100 flex-row items-center gap-3">
                                <Dialog
                                  open={isRejectDialogOpen}
                                  onOpenChange={setIsRejectDialogOpen}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest border-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                    >
                                      <X size={16} className="mr-2" /> Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="rounded-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="font-black uppercase tracking-widest">
                                        Rejection Reason
                                      </DialogTitle>
                                      <DialogDescription className="font-medium text-zinc-500">
                                        Provide an explanation for the user on
                                        why this suggestion was turned down.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      value={rejectReason}
                                      onChange={(e) =>
                                        setRejectReason(e.target.value)
                                      }
                                      className="rounded-xl min-h-[100px] resize-none"
                                      placeholder="Duplicate entry or location is outside Cambodia boundaries..."
                                    />
                                    <DialogFooter className="gap-2">
                                      <Button
                                        variant="ghost"
                                        className="rounded-xl font-bold"
                                        onClick={() =>
                                          setIsRejectDialogOpen(false)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        className="rounded-xl bg-rose-600 text-white font-bold h-10 px-6"
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
                                  className="flex-1 h-12 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                                  onClick={() =>
                                    approveMutation.mutate(request.id)
                                  }
                                  disabled={approveMutation.isPending}
                                >
                                  {approveMutation.isPending ? (
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Check size={16} className="mr-2" />
                                  )}
                                  Approve & Publish
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
    </div>
  );
}
