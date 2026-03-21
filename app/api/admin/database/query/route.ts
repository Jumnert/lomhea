import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { command } = await req.json();
    const args = command.trim().split(" ");
    const cmd = args[0].toLowerCase();

    const startTime = Date.now();

    switch (cmd) {
      case "ping":
        await prisma.$queryRaw`SELECT 1`;
        const latency = Date.now() - startTime;
        return NextResponse.json({
          output: `Pinging Database @ postgresql:5432... status: 200 OK. latency: ${latency}ms`,
        });

      case "stats":
        const [users, places, reviews, requests] = await Promise.all([
          prisma.user.count(),
          prisma.place.count(),
          prisma.review.count(),
          prisma.placeRequest.count(),
        ]);
        return NextResponse.json({
          output: `
DATABASE STATISTICS
-------------------
Users:       ${users}
Places:      ${places}
Reviews:     ${reviews}
Requests:    ${requests}
Integrity:   STABLE
Latency:     ${Date.now() - startTime}ms`,
        });

      case "inspect":
        if (!args[1])
          return NextResponse.json({ output: "Usage: inspect [table_name]" });
        const table = args[1].toLowerCase();

        let data: any[] = [];
        if (table === "user") data = await prisma.user.findMany({ take: 3 });
        else if (table === "place")
          data = await prisma.place.findMany({ take: 3 });
        else if (table === "review")
          data = await prisma.review.findMany({ take: 3 });
        else
          return NextResponse.json({
            output: `Error: Table '${table}' is protected or does not exist.`,
          });

        return NextResponse.json({
          output:
            `INSPECTING ${table.toUpperCase()} (Showing first 3 records):\n` +
            JSON.stringify(data, null, 2),
        });

      case "ls":
        return NextResponse.json({
          output: `Tables found: \n- User\n- Session\n- Account\n- Verification\n- Place\n- Review\n- PlaceRequest\n- Favorite\n- Accommodation\n- Food\n- Report`,
        });

      case "help":
        return NextResponse.json({
          output: `Available commands:
  ping            - Test connection latency
  stats           - Database row counts
  inspect [table] - View first 3 rows of a table
  ls              - List available tables
  clear           - Clear terminal window
  help            - This message`,
        });

      default:
        return NextResponse.json({
          output: `lomheash: command not found: ${cmd}. Type 'help' for options.`,
        });
    }
  } catch (error) {
    console.error("Database terminal error:", error);
    return NextResponse.json(
      { output: "FATAL ERROR: Failed to execute system kernel query." },
      { status: 500 },
    );
  }
}
