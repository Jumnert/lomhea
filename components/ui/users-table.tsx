"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  Mail,
  MapPin,
  MoreHorizontal,
  Shield,
  Trash,
  Ban,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UsersTableProps {
  onAddUser: () => void;
}

export const UsersTable = memo(({ onAddUser }: UsersTableProps) => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="border-border bg-card/40 rounded-xl border p-3 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-black tracking-tight text-zinc-900">
            Platform Users
          </h3>
          <p className="text-muted-foreground text-sm font-medium">
            Manage registrations and permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddUser}
            className="font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground italic text-sm">
            No users found.
          </div>
        ) : (
          users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group hover:bg-zinc-50 flex flex-col items-start gap-4 rounded-lg p-4 transition-colors sm:flex-row sm:items-center border border-transparent hover:border-zinc-200"
            >
              <div className="flex w-full items-center gap-4 sm:w-auto">
                <div className="relative">
                  <img
                    src={user.image || `https://avatar.vercel.sh/${user.id}`}
                    alt={user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full bg-zinc-100"
                  />
                  <div
                    className={`border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 ${
                      user.banned ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-bold tracking-tight text-zinc-900">
                      {user.name || "UNNAMED"}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                        user.role === "ADMIN"
                          ? "bg-zinc-900 text-white"
                          : user.role === "CONTRIBUTOR"
                            ? "bg-zinc-100 text-zinc-900"
                            : "bg-zinc-50 text-zinc-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 flex flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:gap-4 font-bold">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase text-zinc-400">
                  <Shield className="h-3 w-3" />
                  <span>{user._count?.reviews || 0} Reviews</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-zinc-200 rounded-lg"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-xl font-bold p-2"
                  >
                    <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2"
                      onClick={() =>
                        updateMutation.mutate({
                          id: user.id,
                          data: {
                            role: user.role === "ADMIN" ? "USER" : "ADMIN",
                          },
                        })
                      }
                    >
                      <Shield className="h-4 w-4 text-zinc-500" />
                      {user.role === "ADMIN" ? "Revoke Admin" : "Make Admin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-amber-600"
                      onClick={() =>
                        updateMutation.mutate({
                          id: user.id,
                          data: { banned: !user.banned },
                        })
                      }
                    >
                      <Ban className="h-4 w-4" />{" "}
                      {user.banned ? "Unban Account" : "Ban Account"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-rose-500 hover:bg-rose-50"
                      onClick={() => {
                        if (confirm("Permanently delete this user?")) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
});

UsersTable.displayName = "UsersTable";
