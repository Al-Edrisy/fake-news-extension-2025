import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Shield, Moon, Sun, Github } from "lucide-react";

interface NavbarProps {
  currentPage?: string;
}

const Navbar = ({ currentPage = "" }: NavbarProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border bg-surface/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left side - Logo only */}
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
          </a>
        </div>
        
        {/* Center - Navigation */}
        {/* Move nav to the right, before GitHub and theme toggle */}
        {/* Remove from center, add here */}
        <nav className="hidden md:flex items-right gap-8 ml-auto mr-4">
          <a 
            href="/" 
            className={`transition-colors ${
              currentPage === 'home' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
            }`}
          >
            Home
          </a>
          <a 
            href="/chat" 
            className={`transition-colors ${
              currentPage === 'chat' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
            }`}
          >
            Chat
          </a>
          <a 
            href="/download" 
            className={`transition-colors ${
              currentPage === 'download' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
            }`}
          >
            Download
          </a>
          <a 
            href="/services" 
            className={`transition-colors ${
              currentPage === 'services' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
            }`}
          >
            Services
          </a>
          {['services', 'docs', 'playground'].includes(currentPage) && (
            <>
              <a 
                href="/docs" 
                className={`transition-colors ${
                  currentPage === 'docs' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                }`}
              >
                Docs
              </a>
              <a 
                href="/playground" 
                className={`transition-colors ${
                  currentPage === 'playground' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                }`}
              >
                Playground
              </a>
            </>
          )}
        </nav>
        
        {/* Right side - GitHub and Theme toggle */}
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/Al-Edrisy/fake-news-extension-2025" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-text hover:text-primary transition-colors flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
          </a>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-border"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;