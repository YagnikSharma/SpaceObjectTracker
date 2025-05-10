import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import MissionControl from "@/pages/mission-control";
import GalacticMap from "@/pages/galactic-map";
import StellarArchives from "@/pages/archives";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/mission-control" component={MissionControl} />
      <Route path="/galactic-map" component={GalacticMap} />
      <Route path="/archives" component={StellarArchives} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Initializing with dark mode by default
function App() {
  useEffect(() => {
    // Set dark mode by default on initial load
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
