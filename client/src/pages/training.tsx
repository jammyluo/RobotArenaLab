import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, CheckCircle, Archive, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { FileUpload } from "@/components/training/file-upload";
import { RewardConfiguration } from "@/components/training/reward-config";
import { TrainingQueue } from "@/components/training/training-queue";
import { TrainingCharts } from "@/components/training/training-charts";
import { LogOutput } from "@/components/training/log-output";
import { apiRequest } from "@/lib/queryClient";
import type { TrainingJob, TrainingMetric } from "@shared/schema";

interface TrainingStats {
  activeJobs: number;
  completedJobs: number;
  modelsCount: number;
  gpuHours: number;
}

export default function TrainingPage() {
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [selectedRewardFile, setSelectedRewardFile] = useState<File | null>(null);
  const [rewardConfig, setRewardConfig] = useState({
    position: 0.7,
    velocity: 0.3,
    energy: 0.5
  });
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  // Fetch training jobs
  const { data: trainingJobs = [] } = useQuery<TrainingJob[]>({
    queryKey: ['/api/training-jobs'],
  });

  // Fetch training metrics for active job
  const { data: trainingMetrics = [] } = useQuery<TrainingMetric[]>({
    queryKey: ['/api/training-metrics', activeJobId],
    enabled: !!activeJobId,
  });

  // Calculate stats
  const stats: TrainingStats = {
    activeJobs: trainingJobs.filter(job => job.status === 'running').length,
    completedJobs: trainingJobs.filter(job => job.status === 'completed').length,
    modelsCount: 0, // Would be fetched from models API
    gpuHours: 1842 // Mock data
  };

  // Start training mutation
  const startTrainingMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', `Training Job ${Date.now()}`);
      formData.append('userId', '1');
      formData.append('status', 'queued');
      formData.append('totalEpochs', '200');
      formData.append('rewardConfig', JSON.stringify(rewardConfig));
      
      if (selectedModelFile) {
        formData.append('modelFile', selectedModelFile);
      }
      if (selectedRewardFile) {
        formData.append('rewardFile', selectedRewardFile);
      }

      const response = await fetch('/api/training-jobs', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to start training');
      }

      return response.json();
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-jobs'] });
      setActiveJobId(newJob.id);
      toast({
        title: "Training Started",
        description: `Successfully started training job: ${newJob.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start training job",
        variant: "destructive",
      });
    },
  });

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
      toast({
        title: "Training Complete",
        description: `Training job ${data.jobId} has finished successfully`,
      });
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
    };
  }, [subscribe, queryClient, activeJobId, toast]);

  // Set active job to first running job if none selected
  useEffect(() => {
    if (!activeJobId && trainingJobs.length > 0) {
      const runningJob = trainingJobs.find(job => job.status === 'running');
      if (runningJob) {
        setActiveJobId(runningJob.id);
      }
    }
  }, [trainingJobs, activeJobId]);

  const canStartTraining = selectedModelFile && selectedRewardFile;

  return (
    <>
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-slate-400">Completed</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Training Configuration */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Model Configuration</h3>
              
              <div className="space-y-4">
                <FileUpload
                  label="Robot Model"
                  accept=".urdf,.sdf"
                  description="Upload URDF/SDF model"
                  onFileSelect={setSelectedModelFile}
                />
                
                <FileUpload
                  label="Reward Function"
                  accept=".py"
                  description="Upload Python reward function"
                  maxSize=".py files only"
                  onFileSelect={setSelectedRewardFile}
                />
              </div>

              <div className="mt-6">
                <RewardConfiguration
                  config={rewardConfig}
                  onChange={setRewardConfig}
                />
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => startTrainingMutation.mutate()}
                disabled={!canStartTraining || startTrainingMutation.isPending}
              >
                <Zap className="w-5 h-5 mr-2" />
                {startTrainingMutation.isPending ? 'Starting...' : 'Start Training'}
              </Button>
            </Card>

            <TrainingQueue jobs={trainingJobs} />
          </div>

          {/* Training Monitoring */}
          <div className="xl:col-span-2 space-y-6">
            {/* Progress and Charts */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-50">Training Progress</h3>
                {activeJobId && (
                  <div className="flex items-center space-x-4">
                    {(() => {
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
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <TrainingCharts metrics={trainingMetrics} />
            </Card>

            <LogOutput jobId={activeJobId || undefined} />
          </div>
        </div>
      </div>
    </>
  );
}
