import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Archive, 
  Users, 
  Video,
  Cpu,
  Settings,
  Activity
} from "lucide-react";

const navigation = [
  { name: "Model Marketplace", href: "/marketplace", icon: Archive },
  { 
    name: "Training Center", 
    href: "/training", 
    icon: Zap,
    children: [
      { name: "Model Configuration", href: "/model-config", icon: Settings },
      { name: "Training Monitor", href: "/training-monitor", icon: Activity }
    ]
  },
  { name: "Model Library", href: "/models", icon: Archive },
  { name: "Community", href: "/community", icon: Users },
  { name: "Remote Validation", href: "/validation", icon: Video },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-50">Robot Arena</h1>
            <p className="text-xs text-slate-400">Isaac Gym Robotics Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href === "/training" && location === "/") ||
              (item.children?.some(child => child.href === location));
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`nav-item ${isActive ? 'active' : ''}`}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
                {item.children && (
                  <ul className="ml-8 mt-2 space-y-2">
                    {item.children.map(child => {
                      const ChildIcon = child.icon;
                      const isChildActive = location === child.href;
                      
                      return (
                        <li key={child.name}>
                          <Link href={child.href}>
                            <a className={`nav-item text-sm ${isChildActive ? 'active' : ''}`}>
                              <ChildIcon className="w-4 h-4 mr-2" />
                              {child.name}
                            </a>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-50">John Doe</p>
            <p className="text-xs text-slate-400">Researcher</p>
          </div>
        </div>
      </div>
    </div>
  );
}
