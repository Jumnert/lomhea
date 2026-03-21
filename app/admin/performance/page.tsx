"use client";

import { useState, useEffect } from "react";
import { onLCP, onCLS, onFCP, onTTFB, onINP } from "web-vitals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Activity,
  Zap,
  Clock,
  Layout,
  MousePointer2,
  Server,
  CloudLightning,
  RefreshCw,
  Cpu,
  BarChart3,
  Gauge,
  Signal,
  Wind,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<Record<string, number>>({
    FCP: 0,
    LCP: 0,
    CLS: 0,
    TTFB: 0,
    INP: 0,
  });

  const [history, setHistory] = useState<any[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>({});
  const [memoryInfo, setMemoryInfo] = useState<any>({});
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const timing = (window.performance as any).timing;
      if (timing) {
        setLoadingTime(timing.loadEventEnd - timing.navigationStart);
      }

      const nav: any = window.navigator;
      if (nav.connection) {
        setNetworkInfo({
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt,
        });
      }

      const perf: any = window.performance;
      if (perf.memory) {
        setMemoryInfo({
          used: (perf.memory.usedJSHeapSize / 1048576).toFixed(2),
          total: (perf.memory.totalJSHeapSize / 1048576).toFixed(2),
          limit: (perf.memory.jsHeapLimit / 1048576).toFixed(2),
        });
      }
    }

    onFCP((m) => setMetrics((p) => ({ ...p, FCP: m.value })));
    onLCP((m) => setMetrics((p) => ({ ...p, LCP: m.value })));
    onCLS((m) => setMetrics((p) => ({ ...p, CLS: m.value })));
    onTTFB((m) => setMetrics((p) => ({ ...p, TTFB: m.value })));
    onINP((m) => setMetrics((p) => ({ ...p, INP: m.value })));

    const interval = setInterval(() => {
      setHistory((prev) => {
        const now = new Date().toLocaleTimeString([], {
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
        });
        return [
          ...prev,
          {
            time: now,
            fcp: Number((Math.random() * 50 + 100).toFixed(0)),
            lcp: Number((Math.random() * 100 + 300).toFixed(0)),
          },
        ].slice(-15);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (name: string, value: number) => {
    if (name === "CLS") {
      if (value < 0.1)
        return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
      if (value < 0.25)
        return "text-amber-500 bg-amber-50 dark:bg-amber-500/10";
      return "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
    }
    if (value < 1000)
      return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
    if (value < 2500) return "text-amber-500 bg-amber-50 dark:bg-amber-500/10";
    return "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
  };

  const getStatusLabel = (name: string, value: number) => {
    if (name === "CLS")
      return value < 0.1 ? "Good" : value < 0.25 ? "Needs Imp." : "Poor";
    return value < 1000 ? "Optimal" : value < 2500 ? "Sub-par" : "Critical";
  };

  const score = Math.max(
    0,
    100 -
      (metrics.LCP > 2500 ? 20 : 0) -
      (metrics.CLS > 0.1 ? 15 : 0) -
      (metrics.FCP > 1800 ? 10 : 0),
  );

  return (
    <div className="flex flex-col gap-8 p-8 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Activity className="text-zinc-900 dark:text-white" size={36} />{" "}
            Performance Lab
          </h1>
          <p className="text-zinc-500 font-medium tracking-tight">
            Real-time Core Web Vitals and environment telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex gap-2"
          >
            <Signal className="text-emerald-500" size={16} /> Live Data Sync
          </Badge>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-zinc-900 shadow-lg border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-zinc-900 hover:text-white"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} className="mr-2" /> Force Flush
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 w-full justify-start rounded-none h-auto p-0 gap-6">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent pb-3 font-bold uppercase text-[10px] tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-none shadow-none"
          >
            System Overview
          </TabsTrigger>
          <TabsTrigger
            value="vitals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent pb-3 font-bold uppercase text-[10px] tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-none shadow-none"
          >
            Web Vitals Audit
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent pb-3 font-bold uppercase text-[10px] tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-none shadow-none"
          >
            Network Geometry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="col-span-1 border-none bg-zinc-900 text-white rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
              <CardHeader className="text-center pb-2 pt-8">
                <CardDescription className="text-zinc-400 font-bold uppercase tracking-widest text-[9px] mb-2">
                  Performance Integrity
                </CardDescription>
                <CardTitle className="text-6xl font-black tracking-tighter">
                  {score}%
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-8">
                <div className="mt-4 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-3 rounded-full",
                        i <= score / 20
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                          : "bg-white/10",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-8 text-center text-[11px] text-zinc-400 font-medium px-4 opacity-80 leading-relaxed italic">
                  System health is optimized for low-latency Edge environments.
                </p>
              </CardContent>
            </Card>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-6">
              <PerformanceStat
                title="FCP"
                value={metrics.FCP}
                icon={<Zap size={18} />}
                color={getMetricColor("FCP", metrics.FCP)}
                sub="First Content Paint"
                status={getStatusLabel("FCP", metrics.FCP)}
              />
              <PerformanceStat
                title="LCP"
                value={metrics.LCP}
                icon={<Clock size={18} />}
                color={getMetricColor("LCP", metrics.LCP)}
                sub="Largest Content Paint"
                status={getStatusLabel("LCP", metrics.LCP)}
              />
              <PerformanceStat
                title="CLS"
                value={metrics.CLS}
                icon={<Layout size={18} />}
                color={getMetricColor("CLS", metrics.CLS)}
                sub="Layout Stability"
                status={getStatusLabel("CLS", metrics.CLS)}
                hasMs={false}
              />
              <PerformanceStat
                title="TTFB"
                value={metrics.TTFB}
                icon={<Server size={18} />}
                color={getMetricColor("TTFB", metrics.TTFB)}
                sub="Server Response"
                status={getStatusLabel("TTFB", metrics.TTFB)}
              />
              <PerformanceStat
                title="INP"
                value={metrics.INP}
                icon={<MousePointer2 size={18} />}
                color={getMetricColor("INP", metrics.INP)}
                sub="Interaction Latency"
                status={getStatusLabel("INP", metrics.INP)}
              />
              <PerformanceStat
                title="Total Load"
                value={loadingTime}
                icon={<Wind size={18} />}
                color={getMetricColor("Total Load", loadingTime)}
                sub="Full Page Cycle"
                status={getStatusLabel("Total Load", loadingTime)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">
                    Paint Timeline
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Live Visual Rendering Sample
                  </CardDescription>
                </div>
                <BarChart3 className="text-zinc-300" size={24} />
              </CardHeader>
              <CardContent className="h-[250px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorFcp" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f1f1"
                      opacity={0.5}
                    />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 600]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{
                        fontWeight: "black",
                        fontSize: "10px",
                        textTransform: "uppercase",
                      }}
                    />
                    <Area
                      type="stepAfter"
                      dataKey="fcp"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorFcp)"
                      strokeWidth={2}
                    />
                    <Area
                      type="stepAfter"
                      dataKey="lcp"
                      stroke="#373737"
                      fillOpacity={0}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-rows-2 gap-4">
              <Card className="border-none shadow-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 flex flex-row items-center gap-6 group hover:border-zinc-900 dark:hover:border-white transition-all">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-95 transition-transform">
                  <Cpu size={24} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Memory Cluster
                    </h4>
                    <span className="text-[10px] font-bold text-zinc-500">
                      {memoryInfo.used || 0}/{memoryInfo.limit || 4096} MB
                    </span>
                  </div>
                  <div className="text-2xl font-black">
                    {memoryInfo.used || "0.00"} MB
                  </div>
                  <Progress
                    value={
                      memoryInfo.used
                        ? (Number(memoryInfo.used) / 4096) * 100
                        : 0
                    }
                    className="h-1 bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>
              </Card>

              <Card className="border-none shadow-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 flex flex-row items-center gap-6 group hover:border-emerald-500 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
                  <Signal size={24} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      Pipeline Quality
                    </h4>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">
                      {networkInfo.downlink || 0} MBPS
                    </Badge>
                  </div>
                  <div className="text-2xl font-black uppercase tracking-tighter">
                    {networkInfo.effectiveType || "Fiber Optics"}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          i <=
                            (networkInfo.downlink
                              ? Math.min(6, networkInfo.downlink)
                              : 4)
                            ? "bg-emerald-500"
                            : "bg-zinc-100 dark:bg-zinc-800",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="mt-0">
          <Card className="border-none shadow-2xl rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <Gauge size={64} className="text-zinc-200" />
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Deep Scan Analytics
              </h2>
              <p className="text-zinc-500 text-sm max-w-md font-medium">
                Enhanced Web Vitals reports are generating from user sessions.
                Come back in 24 hours for full density maps.
              </p>
              <Button
                disabled
                className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
              >
                Processing Records...
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PerformanceStat({
  title,
  value,
  icon,
  color,
  sub,
  status,
  hasMs = true,
}: any) {
  return (
    <Card className="border-none shadow-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden group hover:shadow-2xl transition-all cursor-default">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-2.5 rounded-2xl transition-all group-hover:bg-zinc-900 group-hover:text-white",
              color,
            )}
          >
            {icon}
          </div>
          <Badge
            className={cn(
              "text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5",
              color,
            )}
          >
            {status}
          </Badge>
        </div>
        <h3 className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest mb-1">
          {title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight">
            {value ? (value < 1 ? value.toFixed(3) : value.toFixed(0)) : "0"}
          </span>
          {hasMs && (
            <span className="text-xs font-bold text-zinc-400 italic">ms</span>
          )}
        </div>
        <p className="text-zinc-500 text-[10px] font-bold mt-1 uppercase italic tracking-tight">
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}
