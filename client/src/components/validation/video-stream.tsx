import { useState } from "react";
import { Volume2, Maximize2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VideoStreamProps {
  isConnected?: boolean;
  robotStatus?: {
    battery: number;
    temperature: number;
    status: string;
  };
}

export function VideoStream({ 
  isConnected = false,
  robotStatus = { battery: 87, temperature: 42, status: 'Online' }
}: VideoStreamProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-50">Live Robot Feed</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm text-slate-400">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      
      {/* Video Stream Area */}
      <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden mb-4">
        {isConnected ? (
          // Mock video stream placeholder
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-12 h-12 text-white" />
                </div>
                <p className="text-slate-400">WebRTC Stream Active</p>
                <p className="text-sm text-slate-500 mt-1">Robot camera feed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-slate-400">No video stream available</p>
            <p className="text-sm text-slate-500 mt-1">Start a validation session to connect</p>
          </div>
        )}
        
        {/* Video Controls Overlay */}
        {isConnected && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="icon"
                className="p-2 bg-slate-800/80 backdrop-blur-sm text-white hover:bg-slate-700/80"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-slate-800/80 backdrop-blur-sm text-white hover:bg-slate-700/80"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-white text-sm bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-lg">
              1920x1080 • 30fps
            </div>
          </div>
        )}
      </div>

      {/* Robot Status */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-700 border-slate-600 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{robotStatus.battery}%</div>
          <div className="text-sm text-slate-400">Battery</div>
        </Card>
        <Card className="bg-slate-700 border-slate-600 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{robotStatus.temperature}°C</div>
          <div className="text-sm text-slate-400">Temperature</div>
        </Card>
        <Card className="bg-slate-700 border-slate-600 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{robotStatus.status}</div>
          <div className="text-sm text-slate-400">Status</div>
        </Card>
      </div>
    </Card>
  );
}
