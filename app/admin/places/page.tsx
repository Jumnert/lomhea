"use client";

import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Place } from "@/types/app";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function AdminPlacesPage() {
  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ["admin-places"],
    queryFn: async () => {
      const res = await fetch("/api/places");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Manage Places
          </h1>
          <p className="text-zinc-500 mt-1 uppercase text-xs font-bold tracking-widest leading-relaxed">
            View and edit all locations
          </p>
        </div>
        <Button className="h-12 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-5 w-5" /> Add New Place
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name, province or category..."
              className="pl-10 h-11 border-zinc-200 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-zinc-200 gap-2 font-semibold"
          >
            <Filter size={18} /> Filters
          </Button>
        </div>
      </Card>

      {/* Places Table */}
      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-6 py-4 w-[40%]">Place</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6 py-4">
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              : places?.map((place) => (
                  <TableRow
                    key={place.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border shadow-sm">
                          <Image
                            src={place.images[0] || "/placeholder-place.jpg"}
                            alt={place.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {place.name}
                          </span>
                          <span className="text-xs text-zinc-400 truncate">
                            {place.nameKh || "No Khmer Name"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-lg font-semibold bg-zinc-100 text-zinc-600 border-none px-3"
                      >
                        {place.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {place.province}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={14} className="fill-current" />
                          <span className="text-sm font-bold">
                            {place.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase">
                          {place.reviewCount} Reviews
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {place.isVerified ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-bold text-[10px] py-1 gap-1">
                          <CheckCircle2 size={12} /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200 font-bold text-[10px] py-1 gap-1">
                          <AlertCircle size={12} /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-xl p-2 shadow-2xl"
                        >
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                            <Edit size={16} className="mr-2 text-zinc-400" />{" "}
                            Edit Place
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                            <ExternalLink
                              size={16}
                              className="mr-2 text-zinc-400"
                            />{" "}
                            View on Site
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg cursor-pointer py-2 text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600">
                            <Trash2 size={16} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
