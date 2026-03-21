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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Trash2,
  Loader2,
  MessageSquare,
  AlertTriangle,
  Flag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update status");
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete report");
    },
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin mb-4 text-zinc-400" size={32} />
        <p className="font-black">Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">
              Location Reports
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Review and resolve user alerts about incorrect information.
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3 px-6">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 text-rose-500">
              <Flag size={18} />
              Community Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b px-6">
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Details
                  </TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-zinc-400 italic"
                    >
                      No active reports.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="group hover:bg-zinc-50 transition-colors"
                    >
                      <TableCell className="px-6">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0 border-0",
                            report.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : report.status === "RESOLVED"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-100 text-zinc-500",
                          )}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={report.user?.image} />
                            <AvatarFallback className="font-bold text-[8px] bg-zinc-100 uppercase">
                              {report.user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-xs">
                            {report.user?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-black uppercase tracking-wider text-zinc-900">
                        {report.place?.name}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-rose-600">
                        {report.reason}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-zinc-500 text-[11px] hidden md:table-cell font-medium">
                        {report.details}
                      </TableCell>
                      <TableCell className="text-right px-6 space-x-1">
                        {report.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              onClick={() =>
                                resolveMutation.mutate({
                                  id: report.id,
                                  status: "RESOLVED",
                                })
                              }
                            >
                              <CheckCircle2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg"
                              onClick={() =>
                                resolveMutation.mutate({
                                  id: report.id,
                                  status: "DISMISSED",
                                })
                              }
                            >
                              <XCircle size={14} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => {
                            if (confirm("Permanently delete this report?")) {
                              deleteMutation.mutate(report.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
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
