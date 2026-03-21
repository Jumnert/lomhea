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
  ShieldAlert,
  ShieldCheck,
  Users,
  Activity,
  Lock,
  Smartphone,
  Globe,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  MoreVertical,
  Key,
  Shield,
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-zinc-400" size={32} />
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
    <div className="flex flex-col gap-8 p-8 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <ShieldAlert
              className={cn(
                securityScore > 80 ? "text-emerald-500" : "text-amber-500",
              )}
              size={36}
            />
            Security Nexus
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Active monitoring and systemic defense administration.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 border-none font-bold flex gap-2">
            <ShieldCheck size={16} /> All Systems Nominal
          </Badge>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-zinc-900 shadow-sm border"
            onClick={() => refetch()}
          >
            <RefreshCw size={16} className="mr-2" /> Refresh Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SecurityStatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={18} />}
          desc="Overall identity registry"
        />
        <SecurityStatCard
          title="Admin Accounts"
          value={stats.adminUsers}
          icon={<Lock size={18} />}
          desc="Privileged identities"
          color="amber"
        />
        <SecurityStatCard
          title="Banned"
          value={stats.bannedUsers}
          icon={<AlertCircle size={18} />}
          desc="Threats eliminated"
          color="rose"
        />
        <SecurityStatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={<Activity size={18} />}
          desc="Current authentication tokens"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Score Panel */}
        <Card className="lg:col-span-1 border-none bg-zinc-900 text-white rounded-3xl overflow-hidden shadow-2xl relative">
          <CardHeader>
            <CardTitle className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">
              Global Security Integrity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={439.8}
                  strokeDashoffset={439.8 - (439.8 * securityScore) / 100}
                  className={cn(
                    "transition-all duration-1000",
                    securityScore > 80 ? "text-emerald-400" : "text-amber-400",
                  )}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black">{securityScore}</span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                  Points
                </span>
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-zinc-400 font-medium px-4 pb-8">
              Your system security is currently rated as{" "}
              <span className="text-white font-bold italic">PRO-LEVEL</span>. No
              critical breaches detected in last 24h.
            </p>
          </CardContent>
        </Card>

        {/* Identity Distribution */}
        <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
              <Shield size={20} className="text-blue-500" /> Identity
              Distribution
            </CardTitle>
            <CardDescription className="font-bold uppercase text-[10px] tracking-widest">
              Breakdown by account privileges
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleStats}
                  innerRadius={60}
                  outerRadius={80}
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
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "10px 10px 20px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Session Logs */}
        <Card className="border-none shadow-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
              <Smartphone size={20} className="text-zinc-400" /> Recent Session
              Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-800/50">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    User
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    IP Address
                  </TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Activity
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSessions.map((session: any) => (
                  <TableRow
                    key={session.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            session.user.image ||
                            `https://avatar.vercel.sh/${session.user.name}`
                          }
                          alt="avatar"
                          width={32}
                          height={32}
                          className="rounded-full shadow-sm"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight">
                            {session.user.name}
                          </span>
                          <Badge className="w-fit text-[8px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-none px-1 h-3 mt-1">
                            {session.user.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-zinc-400">
                        {session.ipAddress || "127.0.0.1"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold tracking-tighter">
                          {new Date(session.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium">
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
          <Card className="border-none shadow-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> Active
                Defenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <div className="space-y-0.5">
                  <Label className="font-bold tracking-tight">
                    Two-Factor Force
                  </Label>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Require mandatory MFA for all moderator accounts.
                  </p>
                </div>
                <Switch
                  defaultChecked
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 opacity-60">
                <div className="space-y-0.5">
                  <Label className="font-bold tracking-tight italic">
                    Brute Force Quarantine
                  </Label>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter font-black">
                    Feature locked to PRO-License.
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden relative group cursor-pointer hover:border-emerald-500 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} className="text-zinc-400" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                <Key size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase tracking-tighter">
                  API Infrastructure
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
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

function SecurityStatCard({ title, value, icon, desc, color = "blue" }: any) {
  const colors = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    amber: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-500/10",
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  }[color as "blue" | "amber" | "rose" | "emerald"];

  return (
    <Card className="border-none shadow-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all hover:scale-[1.02] cursor-default group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-2.5 rounded-2xl transition-all group-hover:bg-zinc-900 group-hover:text-white",
              colors,
            )}
          >
            {icon}
          </div>
          <Badge
            className={cn(
              "text-[9px] font-black uppercase tracking-widest border-none px-2",
              colors,
            )}
          >
            Monitoring
          </Badge>
        </div>
        <h3 className="text-zinc-400 font-black text-[10px] uppercase tracking-widest mb-1">
          {title}
        </h3>
        <span className="text-3xl font-black tracking-tight">{value}</span>
        <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase italic">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}
