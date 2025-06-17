import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Activity } from "lucide-react";
import { useLocation } from "wouter";

export default function TrainingPage() {
  const [location, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold text-slate-50 mb-6">Training Center</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className="p-6 bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => setLocation('/model-config')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-50">Model Configuration</h3>
              <p className="text-sm text-slate-400">Configure robot models and reward functions, start new training jobs</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer"
          onClick={() => setLocation('/training-monitor')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-50">Training Monitor</h3>
              <p className="text-sm text-slate-400">View training progress, metrics and logs, manage training queue</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
