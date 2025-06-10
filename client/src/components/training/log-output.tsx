import { useState, useEffect, useRef } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

interface LogOutputProps {
  jobId?: number;
}

export function LogOutput({ jobId }: LogOutputProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useWebSocket();

  // 加载历史日志
  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/training-logs/${jobId}`)
      .then(res => res.json())
      .then(data => setLogs(data));
  }, [jobId]);

  // WebSocket 追加新日志
  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = subscribe('training_log', (data: any) => {
      if (data.jobId === jobId) {
        const newLog: LogEntry = {
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          level: data.level || 'INFO',
          message: data.message
        };
        setLogs(prev => [...prev, newLog].slice(-100));
      }
    });
    return unsubscribe;
  }, [jobId, subscribe]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-logs-${jobId || 'session'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400';
      case 'WARN':
        return 'text-yellow-400';
      case 'INFO':
        return 'text-emerald-400';
      case 'DEBUG':
        return 'text-blue-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-50">Training Logs</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="text-slate-400 hover:text-slate-50"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="text-slate-400 hover:text-slate-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">No logs available. Start a training job to see live logs.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex text-slate-300">
                <span className="text-slate-500 w-20 flex-shrink-0">{log.timestamp}</span>
                <span className={`w-12 flex-shrink-0 ${getLevelColor(log.level)}`}>
                  [{log.level}]
                </span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </Card>
  );
}
