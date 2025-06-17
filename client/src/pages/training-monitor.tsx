import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, CheckCircle, Archive, Clock, RefreshCcw, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { TrainingQueue } from "@/components/training/training-queue";
import { TrainingCharts } from "@/components/training/training-charts";
import { LogOutput } from "@/components/training/log-output";
import type { TrainingJob, TrainingMetric } from "@shared/schema";

interface TrainingStats {
  activeJobs: number;
  completedJobs: number;
  modelsCount: number;
  gpuHours: number;
}

export default function TrainingMonitorPage() {
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const { toast } = useToast();

  // Fetch training jobs
  const { data: trainingJobs = [] } = useQuery<TrainingJob[]>({
    queryKey: ['/api/training-jobs'],
  });

  // Fetch training metrics for active job
  const { data: trainingMetrics = [] } = useQuery<TrainingMetric[]>({
    queryKey: ['/api/training-metrics', activeJobId],
    enabled: !!activeJobId,
    queryFn: async () => {
      if (!activeJobId) return [];
      const res = await fetch(`/api/training-metrics/${activeJobId}`);
      if (!res.ok) throw new Error('Failed to fetch training metrics');
      return res.json();
    }
  });

  // Stop training mutation
  const stopTrainingMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/training-jobs/${jobId}/stop`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to stop training');
      return response.json();
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-jobs'] });
      toast({
        title: "Training Stopped",
        description: `Successfully stopped training job #${jobId}`,
      });
    },
    onError: (_, jobId) => {
      toast({
        title: "Error",
        description: `Failed to stop training job #${jobId}`,
        variant: "destructive",
      });
    },
  });

  // Calculate stats
  const stats: TrainingStats = {
    activeJobs: trainingJobs.filter(job => job.status === 'running').length,
    completedJobs: trainingJobs.filter(job => job.status === 'completed').length,
    modelsCount: 12, // Mock data
    gpuHours: 1842 // Mock data
  };

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribeProgress = subscribe('training_progress', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-jobs'] });
      if (data.jobId === activeJobId) {
        queryClient.invalidateQueries({ queryKey: ['/api/training-metrics', activeJobId] });
      }
    });

    const unsubscribeComplete = subscribe('training_complete', (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-jobs'] });
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
    };
  }, [subscribe, queryClient, activeJobId]);

  // Set active job to first running job if none selected
  useEffect(() => {
    if (!activeJobId && trainingJobs.length > 0) {
      const runningJob = trainingJobs.find(job => job.status === 'running');
      if (runningJob) {
        setActiveJobId(runningJob.id);
      } else {
        setActiveJobId(trainingJobs[0].id);
      }
    }
  }, [trainingJobs, activeJobId]);

  const handleStopTraining = (jobId: number) => {
    if (window.confirm('Are you sure you want to stop this training job?')) {
      stopTrainingMutation.mutate(jobId);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-50">{stats.activeJobs}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completed Jobs</p>
              <p className="text-2xl font-bold text-slate-50">{stats.completedJobs}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Models Trained</p>
              <p className="text-2xl font-bold text-slate-50">{stats.modelsCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">GPU Hours</p>
              <p className="text-2xl font-bold text-slate-50">{stats.gpuHours}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Training Queue */}
        <div className="xl:w-1/3">
          <TrainingQueue 
            jobs={trainingJobs} 
            onStopTraining={handleStopTraining}
            isStoppingJob={stopTrainingMutation.variables as number}
          />
        </div>

        {/* Right: Training Progress + Charts + Logs */}
        <div className="xl:w-2/3">
          <Card className="p-6 bg-slate-800 border-slate-700 flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-50">Training Progress</h3>
                {activeJobId && (() => {
                  const activeJob = trainingJobs.find(job => job.id === activeJobId);
                  if (!activeJob) return null;
                  return (
                    <div className="text-sm text-slate-400 mt-1">
                      <span>Job Name: <span className="text-slate-50 font-medium">{activeJob.name}</span></span>
                      <span className="ml-4">ID: <span className="text-slate-50 font-mono">{activeJob.id}</span></span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition"
                  title="Refresh Training Data"
                  onClick={() => {
                    if (activeJobId) {
                      queryClient.invalidateQueries({ queryKey: ['/api/training-metrics', activeJobId] });
                    }
                  }}
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
                {activeJobId && (() => {
                  const activeJob = trainingJobs.find(job => job.id === activeJobId);
                  if (!activeJob) return null;
                  return (
                    <>
                      <span className="text-sm text-slate-400">
                        Epoch {activeJob.currentEpoch}/{activeJob.totalEpochs}
                      </span>
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${activeJob.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-50">
                        {activeJob.progress}%
                      </span>
                      {activeJob.status === 'running' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStopTraining(activeJob.id)}
                          disabled={stopTrainingMutation.isPending}
                          className="flex items-center ml-2"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          {stopTrainingMutation.isPending ? 'Stopping...' : 'Stop'}
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            {/* Charts Area */}
            <div className="mb-6">
              <TrainingCharts metrics={trainingMetrics} />
            </div>
            {/* Logs Area */}
            <div className="mt-6">
              <LogOutput jobId={activeJobId || undefined} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 