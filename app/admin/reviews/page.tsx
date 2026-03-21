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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (error) => {
      toast.error("Failed to delete review");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin mb-4 text-zinc-400" size={32} />
        <p className="font-black">Loading Feed...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">
              Content Moderation
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Moderate guest feedback and reviews.
            </p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3 px-6">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 text-rose-500">
              <MessageSquare size={18} />
              Platform Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b px-6">
                  <TableHead className="px-6">User</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Comment
                  </TableHead>
                  <TableHead className="text-right px-6 text-rose-500">
                    Danger Zone
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-zinc-400 italic"
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className="group hover:bg-zinc-50 transition-colors"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.user?.image} />
                            <AvatarFallback className="font-bold text-[10px] bg-zinc-100 uppercase">
                              {review.user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-sm">
                            {review.user?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-black uppercase tracking-widest text-zinc-600">
                        {review.place?.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star
                            size={12}
                            className="fill-amber-400 text-amber-400"
                          />
                          <span className="font-black text-xs">
                            {review.rating}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-zinc-500 text-[11px] hidden md:table-cell">
                        {review.comment}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => {
                            if (confirm("Permanently delete this review?")) {
                              deleteMutation.mutate(review.id);
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
