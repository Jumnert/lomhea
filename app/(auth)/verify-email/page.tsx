"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, MapPin } from "lucide-react";
import Link from "next/link";

// Better Auth handles token verification automatically when the user clicks
// the email link — it redirects to this page after success.
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Mail className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-xl">Verification Failed</CardTitle>
          <CardDescription>
            The verification link is invalid or has expired. Please try
            registering again or request a new link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <CardTitle className="text-xl">Email Verified!</CardTitle>
        <CardDescription>
          Your email has been successfully verified. Welcome to Lomhea —
          Cambodia's community map!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Button asChild className="w-full">
          <Link href="/">
            <MapPin className="mr-2 h-4 w-4" />
            Explore the Map
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              Verifying...
            </CardContent>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
