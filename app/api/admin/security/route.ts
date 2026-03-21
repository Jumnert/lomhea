import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      adminUsers,
      bannedUsers,
      activeSessions,
      recentSessions,
      roleStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.session.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: {
          role: true,
        },
      }),
    ]);

    // Simulated "threats" for the wow factor
    const simulatedThreats = [
      {
        id: "1",
        type: "Brute Force",
        status: "Blocked",
        ip: "192.168.1.1",
        time: new Date().toISOString(),
      },
      {
        id: "2",
        type: "SQL Injection",
        status: "Blocked",
        ip: "45.12.33.1",
        time: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return NextResponse.json({
      stats: {
        totalUsers,
        adminUsers,
        bannedUsers,
        activeSessions,
      },
      recentSessions,
      roleStats: roleStats.map((r) => ({
        name: r.role,
        value: r._count.role,
      })),
      threats: simulatedThreats,
    });
  } catch (error) {
    console.error("Security stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch security stats" },
      { status: 500 },
    );
  }
}
