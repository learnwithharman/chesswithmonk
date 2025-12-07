import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import { WelcomeModal } from "./components/WelcomeModal";
import { PageSkeleton } from "./components/PageSkeleton";
import { PerformanceMonitor } from "./components/PerformanceMonitor";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Play = lazy(() => import("./pages/Play"));
const Openings = lazy(() => import("./pages/Openings"));
const LearnOpenings = lazy(() => import("./pages/LearnOpenings"));
const Puzzles = lazy(() => import("./pages/Puzzles"));
const Analysis = lazy(() => import("./pages/Analysis"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  // Initialize dark mode from localStorage, default to true if not set
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Apply dark mode class to document and save to localStorage
  useEffect(() => {
    const html = document.documentElement;
    console.log('Theme changing:', darkMode ? 'dark' : 'light');

    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));

    console.log('HTML classes:', html.className);
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PerformanceMonitor />
        <BrowserRouter>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
            <WelcomeModal />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/play" element={<Play />} />
                <Route path="/openings" element={<Openings />} />
                <Route path="/learn-openings" element={<LearnOpenings />} />
                <Route path="/puzzles" element={<Puzzles />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
