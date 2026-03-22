"use client";

import { memo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Shield,
  Trash,
  Ban,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { VerifyOtpDialog } from "@/components/ui/verify-otp-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UsersTableProps {
  onAddUser: () => void;
}

export const UsersTable = memo(({ onAddUser }: UsersTableProps) => {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    data: any;
    label: string;
  } | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
      toast.success("Action completed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setPendingAction(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAction = (id: string, data: any, label: string) => {
    // Check if it's a sensitive role action (ADMIN role involved)
    const userSnapshot = users.find((u) => u.id === id);
    const isSensitive = data.role === "ADMIN" || userSnapshot?.role === "ADMIN";

    if (isSensitive) {
      setPendingAction({ id, data, label });
      setIsVerifyOpen(true);
    } else {
      updateMutation.mutate({ id, data });
    }
  };

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Platform Users
              </CardTitle>
              <p className="text-muted-foreground text-sm font-normal">
                Manage registrations and permissions.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onAddUser}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px] pl-6">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden md:table-cell text-center">
                    Reviews
                  </TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.banned ? "destructive" : "outline"}
                        >
                          {user.banned ? "Banned" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center text-xs font-medium">
                        {user._count?.reviews || 0}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 dark border-none shadow-2xl bg-zinc-950"
                          >
                            <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(
                                  user.id,
                                  {
                                    role:
                                      user.role === "ADMIN" ? "USER" : "ADMIN",
                                  },
                                  user.role === "ADMIN"
                                    ? "Revoke Admin"
                                    : "Make Admin",
                                )
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {user.role === "ADMIN"
                                ? "Revoke Admin"
                                : "Make Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateMutation.mutate({
                                  id: user.id,
                                  data: {
                                    role:
                                      user.role === "MODERATOR"
                                        ? "USER"
                                        : "MODERATOR",
                                  },
                                })
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {user.role === "MODERATOR"
                                ? "Revoke Moderator"
                                : "Make Moderator"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={
                                user.banned
                                  ? "text-primary"
                                  : "text-destructive"
                              }
                              onClick={() =>
                                updateMutation.mutate({
                                  id: user.id,
                                  data: { banned: !user.banned },
                                })
                              }
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {user.banned ? "Unban Account" : "Ban Account"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive font-medium"
                              onClick={() => {
                                if (confirm("Permanently delete this user?")) {
                                  deleteMutation.mutate(user.id);
                                }
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VerifyOtpDialog
        isOpen={isVerifyOpen}
        onClose={() => {
          setIsVerifyOpen(false);
          setPendingAction(null);
        }}
        onVerified={() => {
          setIsVerifyOpen(false);
          setIsConfirmOpen(true);
        }}
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="dark bg-zinc-950 border-none text-white max-w-[400px]">
          <AlertDialogHeader>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">
              Absolute Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You are about to <strong>{pendingAction?.label}</strong> for this
              account. This is a sensitive operation. Are you 100% sure you want
              to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-transparent border-none text-zinc-400 hover:text-white hover:bg-zinc-900 shadow-none">
              Abort Action
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90"
              onClick={() => {
                if (pendingAction) {
                  updateMutation.mutate({
                    id: pendingAction.id,
                    data: pendingAction.data,
                  });
                }
              }}
            >
              Yes, Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

UsersTable.displayName = "UsersTable";
