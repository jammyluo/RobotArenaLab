import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Topbar } from "@/components/layout/topbar";
import { VideoStream } from "@/components/validation/video-stream";
import type { Model, ValidationSession } from "@shared/schema";

export default function ValidationPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedRobot, setSelectedRobot] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available models
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  // Fetch validation sessions
  const { data: sessions = [] } = useQuery<ValidationSession[]>({
    queryKey: ['/api/validation-sessions'],
  });

  // Create validation session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedModelId || !selectedRobot) {
        throw new Error('Please select both model and robot platform');
      }

      const response = await fetch('/api/validation-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          modelId: parseInt(selectedModelId),
          robotType: selectedRobot,
          status: 'active'
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/validation-sessions'] });
      setIsSessionActive(true);
      toast({
        title: "Session Started",
        description: "Remote validation session initiated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartSession = () => {
    createSessionMutation.mutate();
  };

  const handleStartExecution = () => {
    if (!isSessionActive) return;
    
    toast({
      title: "Execution Started",
      description: "Model execution initiated on remote robot",
    });
  };

  const handleEmergencyStop = () => {
    if (!isSessionActive) return;
    
    toast({
      title: "Emergency Stop",
      description: "Robot execution stopped immediately",
      variant: "destructive",
    });
  };

  const handleResetPosition = () => {
    if (!isSessionActive) return;
    
    toast({
      title: "Position Reset",
      description: "Robot returned to initial position",
    });
  };

  const robotOptions = [
    "Boston Dynamics Spot",
    "ANYmal Quadruped", 
    "Franka Emika Panda"
  ];

  const sessionInfo = {
    duration: "15:42",
    quality: "Excellent",
    latency: "45ms",
    queue: isSessionActive ? "Active" : "Waiting"
  };

  return (
    <>
      <Topbar 
        title="Remote Robot Validation"
        description="Test your models on real hardware remotely"
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Remote Robot Validation</h2>
            <p className="text-slate-400 mt-1">Test your models on real hardware remotely</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            onClick={handleStartSession}
            disabled={createSessionMutation.isPending || !selectedModelId || !selectedRobot}
          >
            <Play className="w-4 h-4 mr-2" />
            {createSessionMutation.isPending ? 'Starting...' : 'Start Session'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Video Stream */}
          <div className="xl:col-span-2">
            <VideoStream 
              isConnected={isSessionActive}
              robotStatus={{
                battery: 87,
                temperature: 42,
                status: isSessionActive ? 'Online' : 'Offline'
              }}
            />
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Model Selection */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Model Deployment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Model
                  </label>
                  <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Choose a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Robot Platform
                  </label>
                  <Select value={selectedRobot} onValueChange={setSelectedRobot}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue placeholder="Choose a robot" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {robotOptions.map((robot) => (
                        <SelectItem key={robot} value={robot}>
                          {robot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  onClick={handleStartSession}
                  disabled={createSessionMutation.isPending || !selectedModelId || !selectedRobot}
                >
                  {createSessionMutation.isPending ? 'Deploying...' : 'Deploy to Robot'}
                </Button>
              </div>
            </Card>

            {/* Remote Controls */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Remote Controls</h3>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  onClick={handleStartExecution}
                  disabled={!isSessionActive}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Execution
                </Button>
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                  onClick={handleEmergencyStop}
                  disabled={!isSessionActive}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Emergency Stop
                </Button>
                
                <Button 
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
                  onClick={handleResetPosition}
                  disabled={!isSessionActive}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Position
                </Button>
              </div>
            </Card>

            {/* Session Info */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Session Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Session Duration</span>
                  <span className="text-slate-50">{sessionInfo.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connection Quality</span>
                  <span className="text-emerald-400">{sessionInfo.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latency</span>
                  <span className="text-slate-50">{sessionInfo.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue Position</span>
                  <span className={isSessionActive ? "text-emerald-400" : "text-slate-50"}>
                    {sessionInfo.queue}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
