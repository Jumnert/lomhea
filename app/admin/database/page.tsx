"use client";

import { useState, useEffect, useRef } from "react";
import {
  Database,
  Terminal as TerminalIcon,
  Globe,
  HardDrive,
  RefreshCw,
  Clock,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ASCII = `
LOMHEA OS [Version 1.0.2452]
(c) Lomhea Systems Architecture.
Kernel: 2.1.0-STABLE
PostgreSQL @ local:5432
`;

export default function DatabaseTerminalPage() {
  const [history, setHistory] = useState<string[]>([
    ASCII,
    "System ready. Type 'help' for available commands.",
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Core Database</h1>
          <p className="text-sm text-muted-foreground">
            Low-level PostgreSQL kernel management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2 px-3">
            <Globe size={14} className="text-primary" />
            Online
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCommand()}
            className="gap-2"
          >
            <RefreshCw
              size={14}
              className={isProcessing ? "animate-spin" : ""}
            />
            Sync Engine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Cpu size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Engine
                  </span>
                  <span className="text-sm font-bold">PostgreSQL 15</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <HardDrive size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Region
                  </span>
                  <span className="text-sm font-bold">SE Asia</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Latency
                  </span>
                  <span className="text-sm font-bold text-primary">22.4ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/10 border-none opacity-80">
            <CardContent className="p-4 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                System Disclaimer
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Raw terminal access is restricted. All commands are audited.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3 bg-black border-none overflow-hidden relative group h-[500px] flex flex-col">
          <div className="flex items-center gap-2 px-4 h-10 bg-muted/5 border-b border-transparent shrink-0">
            <TerminalIcon className="text-muted-foreground" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Lomhea OS Terminal v1.0.2
            </span>
          </div>

          <ScrollArea
            className="flex-1 p-6 font-mono text-sm text-primary/80"
            ref={scrollRef}
          >
            {history.map((line, i) => (
              <pre
                key={i}
                className="whitespace-pre-wrap leading-relaxed transition-all font-mono tracking-tight opacity-90 group-hover:opacity-100 mb-2"
              >
                {line}
              </pre>
            ))}
            {isProcessing && (
              <div className="flex gap-2 items-center text-primary/50 animate-pulse font-mono translate-y-1 mt-4">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                Processing...
              </div>
            )}
          </ScrollArea>

          <div className="h-12 px-6 bg-muted/5 border-t border-transparent flex items-center gap-3 shrink-0">
            <div className="text-primary font-bold font-mono text-xs shrink-0">
              admin@root ~ $
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCommand()}
              disabled={isProcessing}
              placeholder="_"
              className="flex-1 bg-transparent border-none outline-none text-primary font-mono text-sm caret-primary placeholder-primary/20"
              autoFocus
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
