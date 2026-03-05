"use client";

import {
  Users,
  MapPin,
  MessageSquare,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery<any>({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error("Failed to fetch overview");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-bold uppercase tracking-widest text-xs">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Users",
      value: overview?.stats.totalUsers.toLocaleString(),
      icon: Users,
      change: "+0%",
      trend: "up",
    },
    {
      name: "Total Places",
      value: overview?.stats.totalPlaces.toLocaleString(),
      icon: MapPin,
      change: "+0",
      trend: "up",
    },
    {
      name: "Reviews Received",
      value: overview?.stats.totalReviews.toLocaleString(),
      icon: MessageSquare,
      change: "+0%",
      trend: "up",
    },
    {
      name: "Total Favorites",
      value: overview?.stats.totalFavorites.toLocaleString(),
      icon: Heart,
      change: "+0%",
      trend: "up",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500 mt-1 uppercase text-xs font-bold tracking-widest">
          Lomhea Admin Panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none hover:scale-[1.02] transition-transform"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-primary">
                    <Icon size={24} />
                  </div>
                  <div
                    className={cn(
                      "flex items-center text-xs font-bold px-2.5 py-1 rounded-full",
                      stat.trend === "up"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600",
                    )}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight size={14} className="mr-1" />
                    ) : (
                      <ArrowDownRight size={14} className="mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-zinc-500">
                    {stat.name}
                  </span>
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reviews */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Recent Reviews
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-bold"
              asChild
            >
              <Link href="/admin/reviews">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">User</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview?.recentReviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-zinc-400 font-medium italic"
                    >
                      No reviews yet
                    </TableCell>
                  </TableRow>
                ) : (
                  overview?.recentReviews.map((review: any) => (
                    <TableRow
                      key={review.id}
                      className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.user?.image} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {review.user?.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-sm">
                            {review.user?.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                        {review.place?.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star
                            size={14}
                            className="fill-amber-400 text-amber-400"
                          />
                          <span className="text-sm font-bold">
                            {review.rating}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-400 font-bold">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Place Requests */}
        <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              New Requests
            </CardTitle>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
              {overview?.pendingRequests.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {overview?.pendingRequests.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-zinc-400 text-sm italic">
                  No pending requests
                </div>
              ) : (
                overview?.pendingRequests.map((req: any) => (
                  <div
                    key={req.id}
                    className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center border shadow-sm shrink-0">
                      <MapPin size={24} className="text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-start text-left">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-left">
                          {req.nameEn}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-500 truncate text-left">
                        {req.province}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs font-bold border-zinc-200 hover:bg-primary/5 hover:text-primary"
                          asChild
                        >
                          <Link href="/admin/requests">Review</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-bold border-dashed text-zinc-500 border-zinc-300"
                asChild
              >
                <Link href="/admin/requests">View All Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Star({ size, className }: { size: number; className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
