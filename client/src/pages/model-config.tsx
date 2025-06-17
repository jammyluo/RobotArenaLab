import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/training/file-upload";
import { RewardConfiguration } from "@/components/training/reward-config";

export default function ModelConfigPage() {
  const [modelName, setModelName] = useState(`Training Job ${new Date().toLocaleDateString()}`);
  const [selectedModelFile, setSelectedModelFile] = useState<File | null>(null);
  const [selectedRewardFile, setSelectedRewardFile] = useState<File | null>(null);
  const [rewardConfig, setRewardConfig] = useState({
    position: 0.7,
    velocity: 0.3,
    energy: 0.5
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Start training mutation
  const startTrainingMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', modelName);
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
      toast({
        title: "Training Job Created",
        description: `Successfully created training job: ${newJob.name}`,
      });
      // Redirect to training monitor page after successful creation
      window.location.href = '/training-monitor';
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create training job",
        variant: "destructive",
      });
    },
  });

  const canStartTraining = modelName.trim() && selectedModelFile && selectedRewardFile;

  return (
    <div className="container max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-50">Model Configuration</h2>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          onClick={() => startTrainingMutation.mutate()}
          disabled={!canStartTraining || startTrainingMutation.isPending}
        >
          <Zap className="w-4 h-4 mr-2" />
          {startTrainingMutation.isPending ? 'Creating...' : 'Start Training'}
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-4">
              <div>
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-50"
                  placeholder="Enter model name"
                />
              </div>
              <FileUpload
                label="Robot Model"
                accept=".urdf,.sdf"
                description="Upload URDF/SDF model file"
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
          </Card>
        </div>
        
        <Card className="p-4 bg-slate-800 border-slate-700">
          <RewardConfiguration config={rewardConfig} onChange={setRewardConfig} />
        </Card>
      </div>
    </div>
  );
} 