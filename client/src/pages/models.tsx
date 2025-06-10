import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ModelCard } from "@/components/models/model-card";
import type { Model } from "@shared/schema";

export default function ModelsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch models
  const { data: models = [], isLoading } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  // Download model mutation
  const downloadModelMutation = useMutation({
    mutationFn: async (modelId: number) => {
      const model = models.find(m => m.id === modelId);
      if (!model) throw new Error('Model not found');
      
      // Update download count
      await fetch(`/api/models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloads: model.downloads + 1 }),
        credentials: 'include',
      });
      
      return model;
    },
    onSuccess: (model) => {
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
      toast({
        title: "Download Started",
        description: `Downloading ${model.name}...`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download model",
        variant: "destructive",
      });
    },
  });

  const handleDownload = (model: Model) => {
    downloadModelMutation.mutate(model.id);
  };

  const handleShare = (model: Model) => {
    navigator.clipboard.writeText(`${window.location.origin}/models/${model.id}`);
    toast({
      title: "Link Copied",
      description: `Share link for ${model.name} copied to clipboard`,
    });
  };

  const handleDeploy = (model: Model) => {
    toast({
      title: "Deployment Started",
      description: `Deploying ${model.name} to training environment...`,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i}
            className="h-64 bg-slate-800 border border-slate-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Model Library</h2>
          <p className="text-slate-400 mt-1">Browse and manage your trained models</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Upload Model
        </Button>
      </div>

      {models.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-50 mb-2">No models yet</h3>
          <p className="text-slate-400 mb-4">
            Upload your first trained model to get started
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Upload Model
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onDownload={handleDownload}
              onShare={handleShare}
              onDeploy={handleDeploy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
