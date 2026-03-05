"use client";

import {
  Search,
  MoreVertical,
  UserPlus,
  Shield,
  UserX,
  Mail,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  MoreHorizontal,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@lomhea.com",
    role: "ADMIN",
    joined: "2024-01-15",
    status: "Active",
    reviews: 52,
  },
  {
    id: "2",
    name: "Sokha Mean",
    email: "sokha@example.com",
    role: "CONTRIBUTOR",
    joined: "2024-02-10",
    status: "Active",
    reviews: 18,
  },
  {
    id: "3",
    name: "Dara Kong",
    email: "dara@example.com",
    role: "USER",
    joined: "2024-02-15",
    status: "Banned",
    reviews: 2,
  },
  {
    id: "4",
    name: "Bopha Roth",
    email: "bopha@test.com",
    role: "USER",
    joined: "2024-03-01",
    status: "Active",
    reviews: 0,
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Manage Users
          </h1>
          <p className="text-zinc-500 mt-1 uppercase text-xs font-bold tracking-widest">
            Control access and roles
          </p>
        </div>
        <Button className="h-12 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <UserPlus className="mr-2 h-5 w-5" /> Invide Contributor
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10 h-11 border-zinc-200 rounded-xl"
          />
        </div>
      </Card>

      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="px-6 py-4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-zinc-400 truncate flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.role === "ADMIN" ? (
                    <Badge className="bg-primary/10 text-primary border-none font-bold uppercase text-[9px] tracking-widest gap-1">
                      <Shield size={10} /> Admin
                    </Badge>
                  ) : user.role === "CONTRIBUTOR" ? (
                    <Badge className="bg-amber-50 text-amber-600 border-none font-bold uppercase text-[9px] tracking-widest gap-1">
                      <ShieldCheck size={10} /> Contributor
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-zinc-200 text-zinc-500 font-bold uppercase text-[9px] tracking-widest"
                    >
                      User
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
                    <Calendar size={14} className="text-zinc-400" />
                    {user.joined}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {user.reviews}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">
                      Reviews
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.status === "Active" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-600">
                        {user.status}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-rose-600">
                        {user.status}
                      </span>
                    </div>
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
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl p-2 shadow-2xl"
                    >
                      <DropdownMenuLabel>Manage Permissions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                        <ShieldCheck size={16} className="mr-2 text-primary" />{" "}
                        Make Contributor
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                        <Shield size={16} className="mr-2 text-zinc-500" /> Make
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-lg cursor-pointer py-2 text-rose-500 hover:bg-rose-50">
                        <UserX size={16} className="mr-2" /> Ban User
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
