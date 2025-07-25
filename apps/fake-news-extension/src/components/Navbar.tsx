import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Shield, Moon, Sun, Github, Menu } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  currentPage?: string;
}

const Navbar = ({ currentPage = "" }: NavbarProps) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left side - Logo only */}
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 ml-auto mr-4">
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-6">
                <a 
                  href="/" 
                  className={`text-lg transition-colors ${
                    currentPage === 'home' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="/chat" 
                  className={`text-lg transition-colors ${
                    currentPage === 'chat' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Chat
                </a>
                <a 
                  href="/download" 
                  className={`text-lg transition-colors ${
                    currentPage === 'download' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Download
                </a>
                <a 
                  href="/services" 
                  className={`text-lg transition-colors ${
                    currentPage === 'services' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Services
                </a>
                {['services', 'docs', 'playground'].includes(currentPage) && (
                  <>
                    <a 
                      href="/docs" 
                      className={`text-lg transition-colors ${
                        currentPage === 'docs' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Docs
                    </a>
                    <a 
                      href="/playground" 
                      className={`text-lg transition-colors ${
                        currentPage === 'playground' ? 'text-primary font-medium' : 'text-muted-text hover:text-primary'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Playground
                    </a>
                  </>
                )}
                <div className="border-t border-border pt-6 mt-6">
                  <a 
                    href="https://github.com/Al-Edrisy/fake-news-extension-2025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-lg text-muted-text hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Github className="h-5 w-5" />
                    GitHub
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Right side - GitHub and Theme toggle */}
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/Al-Edrisy/fake-news-extension-2025" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex text-muted-text hover:text-primary transition-colors items-center gap-2"
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