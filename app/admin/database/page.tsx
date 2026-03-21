"use client";

import { useState, useEffect, useRef } from "react";
import {
  Database,
  Terminal as TerminalIcon,
  Search,
  Zap,
  Server,
  Cpu,
  Globe,
  HardDrive,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ASCII = `
LOMHEA OS [Version 1.0.2452]
(c) Lomhea Systems Architecture. All rights reserved.
Kernel version: 2.1.0-STABLE
Connected to PostgreSQL @ local:5432
`;

export default function DatabaseTerminalPage() {
  const [history, setHistory] = useState<string[]>([
    ASCII,
    "System ready. Type 'help' for available commands.",
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [healthScore, setHealthScore] = useState(98);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setInput("");

    if (cmd.toLowerCase() === "clear") {
      setHistory([ASCII]);
      return;
    }

    setHistory((prev) => [...prev, `> ${cmd}`]);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        data.output || "Error: Unknown kernel failure.",
      ]);
    } catch (e) {
      setHistory((prev) => [...prev, "FATAL: System connection interrupted."]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Database className="text-zinc-900" size={36} /> Core Database
          </h1>
          <p className="text-zinc-500 font-medium tracking-tight italic">
            Low-level PostgreSQL kernel management.
          </p>
        </div>
        <div className="flex gap-4">
          <Badge className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 border-none font-bold flex gap-2">
            <Globe size={16} /> Online
          </Badge>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-zinc-900 shadow-sm border"
            onClick={() => handleCommand()}
          >
            <RefreshCw size={16} className="mr-2" /> Sync Engine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
        {/* System Monitor Panel */}
        <div className="lg:col-span-1 space-y-4 h-full">
          <Card className="border-none shadow-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>System Integrity</span>
              <span className="text-emerald-500">Normal</span>
            </div>
            <div className="text-4xl font-black">{healthScore}%</div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl bg-black text-white p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Cpu className="text-zinc-600" size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Engine Type
                </span>
                <span className="font-bold text-sm tracking-tight text-zinc-200">
                  PostgreSQL 15
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HardDrive className="text-zinc-600" size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Region Status
                </span>
                <span className="font-bold text-sm tracking-tight text-zinc-200">
                  South-East Asia
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-emerald-500 animate-pulse" size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Last Ping
                </span>
                <span className="font-mono text-sm tracking-tight text-emerald-500">
                  22.4ms
                </span>
              </div>
            </div>
          </Card>

          <div className="p-6 rounded-3xl bg-zinc-900 shadow-2xl space-y-2 opacity-50 select-none">
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">
              System Disclaimer
            </p>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Access to raw kernel queries is restricted to tier-1
              administrators. All commands are logged.
            </p>
          </div>
        </div>

        {/* Terminal Interface */}
        <div className="lg:col-span-3 h-full pb-8">
          <div className="w-full h-full bg-black rounded-3xl border-2 border-zinc-900 shadow-3xl overflow-hidden flex flex-col relative group">
            {/* CRT Scanlines Overlay */}
            <div
              className="absolute inset-x-0 inset-y-0 pointer-events-none opacity-[0.03] select-none"
              style={{
                background:
                  "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                backgroundSize: "100% 4px, 3px 100%",
              }}
            />

            <div className="flex items-center gap-2 px-6 h-12 border-b border-zinc-900 bg-zinc-950 shrink-0">
              <TerminalIcon className="text-zinc-700" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Lomhea OS Terminal v1.0.2
              </span>
              <div className="ml-auto flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-800" />
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 p-8 font-mono text-sm overflow-y-auto selection:bg-emerald-500/30 text-emerald-500/80 space-y-2 custom-scrollbar"
            >
              {history.map((line, i) => (
                <pre
                  key={i}
                  className="whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300 transition-all font-mono tracking-tight opacity-90 group-hover:opacity-100"
                >
                  {line}
                </pre>
              ))}
              {isProcessing && (
                <div className="flex gap-2 items-center text-emerald-500/50 animate-pulse font-mono translate-y-1">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  Processing request...
                </div>
              )}
            </div>

            <div className="h-16 px-8 border-t border-zinc-900 bg-zinc-950 flex items-center gap-3 shrink-0 group focus-within:border-emerald-500/30 transition-colors">
              <div className="text-emerald-500 font-bold font-mono">
                lomhea:admin@root ~ $
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommand()}
                disabled={isProcessing}
                placeholder="_"
                className="flex-1 bg-transparent border-none outline-none text-emerald-500 font-mono text-sm font-bold caret-emerald-500 placeholder-emerald-900/50"
                autoFocus
              />
              {input && (
                <div className="text-[10px] font-black uppercase text-zinc-700 select-none animate-in fade-in slide-in-from-right-2">
                  Hit Enter to Execute
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}</style>
    </div>
  );
}
