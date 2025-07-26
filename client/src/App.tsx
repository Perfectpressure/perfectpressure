import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CostCalculator from "@/pages/cost-calculator";
import Services from "@/pages/services";
import Blog from "@/pages/blog";
import AdminDashboard from "@/pages/admin-enhanced";
import PageBuilder from "@/pages/page-builder";
import { useState } from "react";

function Router() {
  // Check if admin access is unlocked (stored in sessionStorage)
  const isAdminUnlocked = sessionStorage.getItem("adminUnlocked") === "true";
  
  // Admin access component that checks for secret access
  const AdminAccess = () => {
    if (!isAdminUnlocked) {
      return <NotFound />;
    }
    return <AdminDashboard />;
  };

  const handleAdminUnlock = () => {
    sessionStorage.setItem("adminUnlocked", "true");
    window.location.href = "/admin"; // Force navigation
  };

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cost-calculator">
        <CostCalculator onAdminUnlock={handleAdminUnlock} />
      </Route>
      <Route path="/services" component={Services} />
      <Route path="/blog" component={Blog} />
      <Route path="/admin" component={AdminAccess} />
      <Route path="/page-builder">
        <PageBuilder onSave={(sections) => console.log('Saving sections:', sections)} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
