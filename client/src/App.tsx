import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import TrainingPage from "@/pages/training";
import ModelsPage from "@/pages/models";
import CommunityPage from "@/pages/community";
import ValidationPage from "@/pages/validation";
import NotFound from "@/pages/not-found";
import MarketplacePage from "@/pages/marketplace";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TrainingPage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/models" component={ModelsPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/validation" component={ValidationPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  let title = "Training Platform";
  let description = "Configure and monitor your robot training experiments";
  if (location === "/models") {
    title = "Model Library";
    description = "Browse and manage your robot models";
  } else if (location === "/community") {
    title = "Community";
    description = "Share and discuss with other users";
  } else if (location === "/validation") {
    title = "Remote Validation";
    description = "Validate your models remotely";
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex bg-slate-900 text-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar title={title} description={description} />
            <main className="flex-1 overflow-auto p-6">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
