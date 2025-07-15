
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Docs from "./pages/Docs";
import Services from "./pages/Services";
import Download from "./pages/Download";
import Playground from "./pages/Playground";
import NotFound from "./pages/NotFound";
import PWAInstall from "./components/PWAInstall";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/download" element={<Download />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/chat" element={<Chat />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <PWAInstall />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
