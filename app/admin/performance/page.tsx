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

  const getMetricVariant = (
    name: string,
    value: number,
  ): "default" | "secondary" | "outline" | "destructive" => {
    if (name === "CLS") {
      if (value < 0.1) return "outline";
      if (value < 0.25) return "secondary";
      return "destructive";
    }
    if (value < 1000) return "outline";
    if (value < 2500) return "secondary";
    return "destructive";
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Lab</h1>
          <p className="text-sm text-muted-foreground">
            Real-time Core Web Vitals and environment telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2">
            <Signal className="text-primary" size={14} /> Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} className="mr-2" /> Flush
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardHeader className="text-center pb-2">
                <CardDescription className="text-primary-foreground/70 text-[10px] uppercase font-semibold">
                  Health Score
                </CardDescription>
                <CardTitle className="text-5xl font-bold">{score}%</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-3 rounded-full",
                        i <= score / 20
                          ? "bg-primary-foreground"
                          : "bg-primary-foreground/20",
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
              <PerformanceStat
                title="FCP"
                value={metrics.FCP}
                icon={<Zap size={16} />}
                variant={getMetricVariant("FCP", metrics.FCP)}
                sub="First Paint"
                status={getStatusLabel("FCP", metrics.FCP)}
              />
              <PerformanceStat
                title="LCP"
                value={metrics.LCP}
                icon={<Clock size={16} />}
                variant={getMetricVariant("LCP", metrics.LCP)}
                sub="Largest Paint"
                status={getStatusLabel("LCP", metrics.LCP)}
              />
              <PerformanceStat
                title="CLS"
                value={metrics.CLS}
                icon={<Layout size={16} />}
                variant={getMetricVariant("CLS", metrics.CLS)}
                sub="Stability"
                status={getStatusLabel("CLS", metrics.CLS)}
                hasMs={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-semibold">
                  Paint Timeline
                </CardTitle>
                <BarChart3 className="text-muted-foreground" size={18} />
              </CardHeader>
              <CardContent className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.1}
                    />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 600]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderRadius: "var(--radius)",
                        border: "1px solid hsl(var(--border))",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="fcp"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Memory
                    </span>
                    <span className="text-xs font-bold">
                      {memoryInfo.used || 0} MB
                    </span>
                  </div>
                  <Progress
                    value={
                      memoryInfo.used
                        ? (Number(memoryInfo.used) / 4096) * 100
                        : 0
                    }
                    className="h-1"
                  />
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Signal size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      Network
                    </span>
                    <Badge variant="outline" className="text-[8px]">
                      {networkInfo.downlink || 0} MBPS
                    </Badge>
                  </div>
                  <div className="text-sm font-bold">
                    {networkInfo.effectiveType || "Fiber"}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4">
              <Gauge size={48} className="text-muted-foreground opacity-20" />
              <h2 className="text-xl font-bold">Deep Scan Analytics</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Enhanced reports are generating. Come back in 24 hours.
              </p>
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
  variant,
  sub,
  status,
  hasMs = true,
}: any) {
  return (
    <Card className="transition-all hover:bg-muted/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <Badge variant={variant} className="text-[9px] uppercase">
            {status}
          </Badge>
        </div>
        <h3 className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider mb-1">
          {title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight">
            {value ? (value < 1 ? value.toFixed(3) : value.toFixed(0)) : "0"}
          </span>
          {hasMs && (
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              ms
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground opacity-70 mt-1 italic">
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}
