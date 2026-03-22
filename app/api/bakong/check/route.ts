import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BakongClient } from "@/lib/bakong";

function isValidMd5(md5: string) {
  return /^[a-fA-F0-9]{32}$/.test(md5);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const md5 = body?.md5 as string | undefined;

    if (!md5 || !isValidMd5(md5)) {
      return NextResponse.json({ error: "Invalid md5" }, { status: 400 });
    }

    const checked = await BakongClient.checkTransactionStatus({ md5 });

    return NextResponse.json({
      status: checked.status,
      message: checked.responseMessage,
      transaction: checked.data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error);
    if (
      message.includes("connect timeout") ||
      message.includes("fetch failed") ||
      message.includes("und_err_connect_timeout")
    ) {
      return NextResponse.json(
        {
          status: "UNAVAILABLE",
          message:
            "Bakong API is unreachable from this environment. Check BAKONG_BASE_URL/network/VPN.",
          transaction: null,
        },
        { status: 503 },
      );
    }

    console.error("Bakong check route error:", error);
    return NextResponse.json(
      { error: "Failed to check transaction status" },
      { status: 500 },
    );
  }
}
