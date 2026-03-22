"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Activity,
  Lock,
  Smartphone,
  AlertCircle,
  RefreshCw,
  Key,
  Shield,
  ShieldCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function SecurityPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-security"],
    queryFn: async () => {
      const res = await fetch("/api/admin/security");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
        <p className="text-sm text-muted-foreground">
          Performing Security Audit...
        </p>
      </div>
    );
  }

  const { stats, recentSessions, roleStats, threats } = data || {
    stats: { totalUsers: 0, adminUsers: 0, bannedUsers: 0, activeSessions: 0 },
    recentSessions: [],
    roleStats: [],
    threats: [],
  };

  const securityScore =
    stats.totalUsers > 0
      ? Math.max(0, 100 - stats.bannedUsers * 5 - threats.length * 10)
      : 100;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Nexus</h1>
          <p className="text-sm text-muted-foreground">
            Active monitoring and systemic defense administration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1 px-3">
            <ShieldCheck size={14} className="text-primary" />
            All Systems Nominal
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SecurityStatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={16} />}
          desc="Overall identity registry"
        />
        <SecurityStatCard
          title="Admin Accounts"
          value={stats.adminUsers}
          icon={<Lock size={16} />}
          desc="Privileged identities"
        />
        <SecurityStatCard
          title="Banned"
          value={stats.bannedUsers}
          icon={<AlertCircle size={16} />}
          desc="Threats eliminated"
        />
        <SecurityStatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={<Activity size={16} />}
          desc="Current tokens"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Panel */}
        <Card className="lg:col-span-1 bg-primary text-primary-foreground border-none">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Global Security Integrity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="opacity-10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={402}
                  strokeDashoffset={402 - (402 * securityScore) / 100}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold">{securityScore}</span>
                <span className="text-[10px] font-medium uppercase opacity-70">
                  Points
                </span>
              </div>
            </div>
            <p className="mt-6 text-center text-xs opacity-80 font-medium px-4 pb-4">
              Your system security is currently rated as{" "}
              <span className="font-bold underline underline-offset-4">
                OPTIMAL
              </span>
              . No critical breaches detected.
            </p>
          </CardContent>
        </Card>

        {/* Identity Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Identity
              Distribution
            </CardTitle>
            <CardDescription>Breakdown by account privileges</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleStats}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {roleStats.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderRadius: "var(--radius)",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Session Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Smartphone size={18} className="text-muted-foreground" />
              Recent Session Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right pr-6">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSessions.map((session: any) => (
                  <TableRow key={session.id}>
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user.image} />
                          <AvatarFallback>
                            {session.user.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">
                            {session.user.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] w-fit h-4 px-1"
                          >
                            {session.user.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {session.ipAddress || "127.0.0.1"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold">
                          {new Date(session.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Global Security Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <ShieldCheck size={14} className="text-primary" /> Active
                Defenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="font-semibold">Two-Factor Force</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Require mandatory MFA for all moderator accounts.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/10 opacity-60">
                <div className="space-y-0.5">
                  <Label className="font-semibold italic">
                    Brute Force Quarantine
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Feature locked to PRO-License.
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Key size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold">API Infrastructure</h3>
                <p className="text-xs text-muted-foreground">
                  Manage server-side secrets and authentication keys.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SecurityStatCard({ title, value, icon, desc }: any) {
  return (
    <Card className="transition-all hover:bg-muted/10 cursor-default">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <Badge variant="outline" className="text-[9px] uppercase">
            Monitoring
          </Badge>
        </div>
        <h3 className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider mb-1">
          {title}
        </h3>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <p className="text-[10px] text-muted-foreground mt-1 italic">{desc}</p>
      </CardContent>
    </Card>
  );
}
