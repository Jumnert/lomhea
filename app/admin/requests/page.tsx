"use client";

import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  ExternalLink,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approveRequest, rejectRequest } from "../actions";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/requests");
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setSelectedRequestId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setSelectedRequestId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-bold">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Place Requests
          </h1>
          <p className="text-zinc-500 mt-1 uppercase text-xs font-bold tracking-widest leading-relaxed">
            Review suggestions from the community
          </p>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-6 py-4">Submitted By</TableHead>
              <TableHead>Place Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-zinc-400 font-medium"
                >
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow
                  key={req.id}
                  className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={req.user?.image} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {req.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm">
                        {req.user?.name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                    {req.nameEn}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-lg font-bold text-[10px] uppercase tracking-wider text-zinc-500 border-zinc-200"
                    >
                      {req.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {req.province}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold">
                      <Calendar size={12} />{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-bold text-[10px] py-1 gap-1 border",
                        req.status === "PENDING" &&
                          "bg-amber-50 text-amber-600 border-amber-100",
                        req.status === "APPROVED" &&
                          "bg-emerald-50 text-emerald-600 border-emerald-100",
                        req.status === "REJECTED" &&
                          "bg-rose-50 text-rose-600 border-rose-100",
                      )}
                    >
                      {req.status === "PENDING" && <Clock size={12} />}
                      {req.status === "APPROVED" && <CheckCircle size={12} />}
                      {req.status === "REJECTED" && <XCircle size={12} />}
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Dialog
                      open={selectedRequestId === req.id}
                      onOpenChange={(open) =>
                        setSelectedRequestId(open ? req.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-zinc-200 font-bold hover:bg-primary/5 hover:text-primary transition-all"
                        >
                          <Eye size={16} className="mr-2" /> Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                        <div className="bg-primary h-32 relative">
                          <div className="absolute -bottom-8 left-8 flex items-end gap-4">
                            <div className="h-24 w-24 rounded-3xl bg-white dark:bg-zinc-900 p-2 shadow-xl">
                              <div className="w-full h-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <MapPin size={32} className="text-primary" />
                              </div>
                            </div>
                            <div className="mb-2">
                              <h3 className="text-2xl font-bold text-white leading-none mb-2">
                                {req.nameEn}
                              </h3>
                              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20">
                                {req.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="pt-12 p-8 space-y-6">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <section>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                                  Province
                                </h4>
                                <p className="font-bold text-lg">
                                  {req.province}
                                </p>
                              </section>
                              <section>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                                  Description
                                </h4>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                                  {req.description}
                                </p>
                              </section>
                              <section>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                  Location Link
                                </h4>
                                <Button
                                  variant="secondary"
                                  className="w-full justify-between h-10 rounded-xl"
                                  asChild
                                >
                                  <a
                                    href={req.googleMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Google Maps <ExternalLink size={14} />
                                  </a>
                                </Button>
                              </section>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                                User Photo Submission
                              </h4>
                              <div className="relative h-48 w-full rounded-2xl overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 shadow-inner">
                                {req.images?.[0] ? (
                                  <Image
                                    src={req.images[0]}
                                    alt="Submission"
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 italic text-xs">
                                    No image provided
                                  </div>
                                )}
                              </div>
                              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-transparent">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                                  Submitted By
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={req.user?.image} />
                                    <AvatarFallback className="text-[8px] font-bold">
                                      {req.user?.name?.[0] || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-bold">
                                    {req.user?.name || "Unknown"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {req.status === "PENDING" && (
                            <DialogFooter className="pt-4 gap-3 bg-zinc-50 dark:bg-zinc-900 -mx-8 -mb-8 p-6">
                              <Button
                                variant="ghost"
                                className="h-12 px-6 rounded-2xl text-rose-600 font-bold hover:bg-rose-50"
                                onClick={() =>
                                  rejectMutation.mutate({
                                    id: req.id,
                                    reason: "Does not meet our criteria",
                                  })
                                }
                                disabled={
                                  rejectMutation.isPending ||
                                  approveMutation.isPending
                                }
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <>
                                    <XCircle size={18} className="mr-2" />{" "}
                                    Reject Request
                                  </>
                                )}
                              </Button>
                              <Button
                                className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold ml-auto shadow-lg shadow-emerald-200/50"
                                onClick={() => approveMutation.mutate(req.id)}
                                disabled={
                                  approveMutation.isPending ||
                                  rejectMutation.isPending
                                }
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <>
                                    <CheckCircle size={18} className="mr-2" />{" "}
                                    Approve & Add Place
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          )}

                          {req.status !== "PENDING" && (
                            <div className="pt-4 p-6 bg-zinc-50 dark:bg-zinc-900 -mx-8 -mb-8 text-center font-bold text-zinc-400 uppercase text-xs tracking-widest">
                              This request has been {req.status.toLowerCase()}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
