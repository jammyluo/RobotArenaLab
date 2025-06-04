import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title?: string;
  description?: string;
}

export function Topbar({ 
  title = "Training Platform", 
  description = "Configure and monitor your robot training experiments" 
}: TopbarProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-50">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
