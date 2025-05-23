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
import { StarryBackground } from "@/components/ui/starry-background";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/detection-hub" component={Home} />
      <Route path="/mission-control">
  <MissionControl />
</Route>
      <Route path="/galactic-map" component={GalacticMap} />
      <Route path="/archives" component={StellarArchives} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Always using dark mode
function App() {
  useEffect(() => {
    // Set dark mode and remove any related classes
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    // Remove any theme values from local storage
    localStorage.removeItem("syndetect-ui-theme");
    localStorage.removeItem("syndetect-theme");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StarryBackground />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
