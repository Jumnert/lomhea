"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export async function approveRequest(id: string) {
  try {
    const res = await fetch(`/api/admin/requests/${id}/approve`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to approve");
    toast.success("Request approved and place added!");
    return true;
  } catch (error: any) {
    toast.error(error.message);
    return false;
  }
}

export async function rejectRequest(id: string, reason: string) {
  try {
    const res = await fetch(`/api/admin/requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reject");
    toast.success("Request rejected");
    return true;
  } catch (error: any) {
    toast.error(error.message);
    return false;
  }
}
