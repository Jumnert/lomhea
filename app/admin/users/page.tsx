"use client";

import { UsersTable } from "@/components/ui/users-table";

export default function AdminUsersPage() {
  const handleAddUser = () => console.log("ADD USER");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-3xl font-black tracking-tighter mb-6">Users</h1>
        <UsersTable onAddUser={handleAddUser} />
      </div>
    </div>
  );
}
