import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrainingJob } from "@shared/schema";

interface TrainingQueueProps {
  jobs: TrainingJob[];
}

export function TrainingQueue({ jobs }: TrainingQueueProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500';
      case 'queued':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Running</Badge>;
      case 'queued':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Queued</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Complete</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Training Queue</h3>
      
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No training jobs in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div 
              key={job.id}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  job.status === 'running' ? 'animate-pulse' : ''
                } ${getStatusColor(job.status)}`} />
                
                <div>
                  <p className="text-sm font-medium text-slate-50">{job.name}</p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(job.status)}
                    {job.status === 'running' && (
                      <span className="text-xs text-slate-400">
                        Epoch {job.currentEpoch}/{job.totalEpochs}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium text-slate-50">
                  {job.progress}%
                </span>
                {job.status === 'running' && (
                  <div className="w-16 h-1.5 bg-slate-600 rounded-full mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
