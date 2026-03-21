"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MapPin,
  Star,
  Heart,
  TrendingUp,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Map,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery<any>({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const stats = [
    {
      title: "Total Users",
      value: overview?.stats?.totalUsers ?? "—",
      description: "Registered accounts",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Locations",
      value: overview?.stats?.totalPlaces ?? "—",
      description: "Places on the map",
      icon: MapPin,
      href: "/admin/places",
    },
    {
      title: "Reviews",
      value: overview?.stats?.totalReviews ?? "—",
      description: "Community ratings",
      icon: Star,
      href: "/admin/reviews",
    },
    {
      title: "Favorites",
      value: overview?.stats?.totalFavorites ?? "—",
      description: "Saved by users",
      icon: Heart,
      href: "/admin/places",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your Lomhea platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Reviews</CardTitle>
              <CardDescription>Latest community feedback</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/reviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.recentReviews?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No reviews yet
              </p>
            ) : (
              overview?.recentReviews?.map((review: any) => (
                <div key={review.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src={review.user?.image} />
                    <AvatarFallback className="text-xs">
                      {review.user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {review.user?.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {review.place?.name}
                    </p>
                    {review.comment && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending Requests</CardTitle>
              <CardDescription>
                User-submitted location suggestions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/requests">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.pendingRequests?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No pending requests
              </p>
            ) : (
              overview?.pendingRequests?.map((req: any) => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Map size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.nameEn}</p>
                    <p className="text-xs text-muted-foreground">
                      by {req.user?.name} · {req.province}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Pending
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Jump to important sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Manage Places", href: "/admin/places", icon: MapPin },
              {
                label: "Review Requests",
                href: "/admin/requests",
                icon: FileText,
              },
              {
                label: "View Reports",
                href: "/admin/reports",
                icon: AlertCircle,
              },
              { label: "Manage Users", href: "/admin/users", icon: Users },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto py-3 flex-col gap-2"
                  asChild
                >
                  <Link href={action.href}>
                    <Icon size={18} className="text-muted-foreground" />
                    <span className="text-xs">{action.label}</span>
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
