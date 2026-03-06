"use client";

import { useSession } from "@/lib/auth-client";
import LandingPage from "@/components/landing/LandingPage";
import { ExplorePage } from "@/components/map/ExplorePage";
import { LomheaLoader } from "@/components/ui/LomheaLoader";

export default function EntryPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LomheaLoader />;
  }

  if (session) {
    return <ExplorePage />;
  }

  return <LandingPage />;
}
