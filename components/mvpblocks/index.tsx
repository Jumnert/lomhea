"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MapPin,
  Star,
  Heart,
  Loader2,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import Link from "next/link";

type OverviewResponse = {
  stats: {
    totalUsers: number;
    totalPlaces: number;
    totalReviews: number;
    totalFavorites: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    user?: { name?: string | null; image?: string | null } | null;
    place?: { name?: string | null } | null;
  }>;
  pendingRequests: Array<{
    id: string;
    nameEn: string;
    province: string;
    createdAt: string;
    user?: { name?: string | null } | null;
  }>;
};

const statsConfig = [
  {
    key: "totalUsers",
    label: "Users",
    desc: "Registered accounts",
    icon: Users,
    href: "/admin/users",
  },
  {
    key: "totalPlaces",
    label: "Places",
    desc: "Published map points",
    icon: MapPin,
    href: "/admin/places",
  },
  {
    key: "totalReviews",
    label: "Reviews",
    desc: "Community feedback",
    icon: Star,
    href: "/admin/reviews",
  },
  {
    key: "totalFavorites",
    label: "Favorites",
    desc: "Saved places",
    icon: Heart,
    href: "/admin/places",
  },
] as const;

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery<OverviewResponse>({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error("Failed to fetch admin overview");
      return res.json();
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card className="border-zinc-200/70 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Admin Overview
          </CardTitle>
          <CardDescription>
            Snapshot of users, content health, and pending moderation tasks.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((item) => {
          const Icon = item.icon;
          const value =
            overview?.stats?.[item.key as keyof OverviewResponse["stats"]] ?? 0;
          return (
            <Card
              key={item.key}
              className="group border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Icon size={18} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 opacity-70 group-hover:opacity-100"
                  >
                    <Link href={item.href}>
                      <ArrowUpRight size={14} />
                    </Link>
                  </Button>
                </div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="mt-1 text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Recent Reviews</CardTitle>
              <CardDescription>Latest community feedback</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.recentReviews?.length ? (
              overview.recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-3"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={review.user?.image || ""} />
                    <AvatarFallback>
                      {review.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <Badge variant="secondary" className="gap-1">
                        <Star size={12} className="fill-current" />
                        {review.rating}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {review.place?.name || "Unknown place"}
                    </p>
                    {review.comment && (
                      <p className="mt-1 line-clamp-2 text-xs">{review.comment}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-muted-foreground">
                No reviews yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Pending Requests</CardTitle>
              <CardDescription>Places waiting for approval</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/requests">Open queue</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.pendingRequests?.length ? (
              overview.pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-3"
                >
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                    <Clock3 size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{req.nameEn}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      by {req.user?.name || "Unknown"} • {req.province}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-muted-foreground">
                No pending requests
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Jump to key moderation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Manage Places", href: "/admin/places", icon: MapPin },
              { label: "Requests", href: "/admin/requests", icon: FileText },
              { label: "Reports", href: "/admin/reports", icon: AlertCircle },
              { label: "Users", href: "/admin/users", icon: Users },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto justify-start gap-3 py-3"
                  asChild
                >
                  <Link href={action.href}>
                    <Icon size={16} />
                    <span>{action.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
