import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import DemandPrediction from "./pages/DemandPrediction";
import NetworkOptimization from "./pages/NetworkOptimization";
import PredictiveMaintenance from "./pages/PredictiveMaintenance";
import RenewableResources from "./pages/RenewableResources";
import ColombiaData from "./pages/ColombiaData";
import NetworkMapPage from "./pages/NetworkMapPage";
import InitializeData from "./pages/InitializeData";

function Router() {
  return (
    <Switch>
      <Route path="/init" component={InitializeData} />
      <Route path="/" component={() => (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      )} />
      <Route path="/demand" component={() => (
        <DashboardLayout>
          <DemandPrediction />
        </DashboardLayout>
      )} />
      <Route path="/optimization" component={() => (
        <DashboardLayout>
          <NetworkOptimization />
        </DashboardLayout>
      )} />
      <Route path="/maintenance" component={() => (
        <DashboardLayout>
          <PredictiveMaintenance />
        </DashboardLayout>
      )} />
      <Route path="/renewable" component={() => (
        <DashboardLayout>
          <RenewableResources />
        </DashboardLayout>
      )} />
      <Route path="/colombia" component={() => (
        <DashboardLayout>
          <ColombiaData />
        </DashboardLayout>
      )} />
      <Route path="/network-map" component={() => (
        <DashboardLayout>
          <NetworkMapPage />
        </DashboardLayout>
      )} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
