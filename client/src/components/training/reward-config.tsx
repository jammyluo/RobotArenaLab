import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface RewardConfig {
  position: number;
  velocity: number;
  energy: number;
}

interface RewardConfigProps {
  config: RewardConfig;
  onChange: (config: RewardConfig) => void;
}

export function RewardConfiguration({ config, onChange }: RewardConfigProps) {
  const handleSliderChange = (key: keyof RewardConfig, value: number[]) => {
    onChange({
      ...config,
      [key]: value[0]
    });
  };

  const rewardTypes = [
    {
      key: 'position' as keyof RewardConfig,
      label: 'Position Accuracy',
      description: 'Reward for accurate position control'
    },
    {
      key: 'velocity' as keyof RewardConfig,
      label: 'Velocity Control',
      description: 'Reward for smooth velocity transitions'
    },
    {
      key: 'energy' as keyof RewardConfig,
      label: 'Energy Efficiency',
      description: 'Penalty for excessive energy consumption'
    }
  ];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        Reward Configuration
      </label>
      
      <div className="space-y-3">
        {rewardTypes.map(({ key, label, description }) => (
          <Card key={key} className="p-4 bg-slate-700 border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-300">{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
              </div>
              <span className="text-sm font-medium text-slate-50 min-w-[3rem] text-right">
                {config[key].toFixed(1)}
              </span>
            </div>
            
            <Slider
              value={[config[key]]}
              onValueChange={(value) => handleSliderChange(key, value)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </Card>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-800 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">Total Weight:</p>
        <div className="flex items-center space-x-2">
          <div 
            className="h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            style={{ 
              width: `${Math.min(100, (config.position + config.velocity + config.energy) * 100)}%` 
            }}
          />
          <span className="text-xs text-slate-300">
            {(config.position + config.velocity + config.energy).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
