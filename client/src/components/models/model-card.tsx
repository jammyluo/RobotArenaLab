import { Download, Share, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Model } from "@shared/schema";

interface ModelCardProps {
  model: Model;
  onDownload?: (model: Model) => void;
  onShare?: (model: Model) => void;
  onDeploy?: (model: Model) => void;
}

export function ModelCard({ model, onDownload, onShare, onDeploy }: ModelCardProps) {
  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'humanoid':
        return 'from-purple-500 to-pink-500';
      case 'quadruped':
        return 'from-emerald-500 to-teal-500';
      case 'manipulator':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTrainingTime = (hours: number | null) => {
    if (!hours) return 'Unknown';
    return `${hours.toFixed(1)} hours`;
  };

  return (
    <Card className="p-6 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-50 mb-1">{model.name}</h3>
          <p className="text-sm text-slate-400">{model.description}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {model.modelType}
            </Badge>
            {model.isPublic && (
              <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-400">
                Public
              </Badge>
            )}
          </div>
        </div>
        <div className={`w-10 h-10 bg-gradient-to-br ${getModelTypeColor(model.modelType)} rounded-lg flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">
            {model.modelType.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Accuracy</span>
          <span className="text-emerald-400 font-medium">
            {model.accuracy ? `${model.accuracy.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Training Time</span>
          <span className="text-slate-300">{formatTrainingTime(model.trainingTime)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Size</span>
          <span className="text-slate-300">{formatFileSize(model.size)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Downloads</span>
          <span className="text-slate-300">{model.downloads}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onDeploy?.(model)}
        >
          Deploy
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onDownload?.(model)}
          className="text-slate-400 hover:text-slate-50 hover:bg-slate-700"
        >
          <Download className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="text-slate-400 hover:text-slate-50 hover:bg-slate-700"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem 
              onClick={() => onShare?.(model)}
              className="text-slate-300 hover:text-slate-50 hover:bg-slate-700"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
