"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => console.log("Exporting...");

  return (
    <div
      className="dark min-h-screen bg-background text-foreground"
      style={
        {
          "--border": "oklch(0.22 0 0)",
          "--sidebar-border": "oklch(0.22 0 0)",
          "--input": "oklch(0.22 0 0)",
          "--ring": "oklch(0.3 0 0)",
          "--shadow": "none",
          "--sidebar-accent": "oklch(1 0 0 / 3%)",
          "--muted": "oklch(1 0 0 / 2%)",
          "--accent": "oklch(1 0 0 / 2%)",
        } as React.CSSProperties
      }
    >
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-background">
          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isRefreshing={isRefreshing}
          />
          <main className="flex flex-1 flex-col">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
