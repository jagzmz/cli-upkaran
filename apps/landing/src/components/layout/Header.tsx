import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icon';

export const Header: React.FC = () => {
  return (
    <header className="py-4 px-4 md:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Icons.Terminal className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">cli-upkaran</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">
            Use Cases
          </a>
          <a href="#ecosystem" className="text-muted-foreground hover:text-foreground transition-colors">
            Ecosystem
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <a href="#getting-started" className="hidden md:inline-block">
            <Button variant="outline" size="sm">
              Docs
            </Button>
          </a>
          <a href="https://github.com/your-org/cli-upkaran" target="_blank" rel="noopener noreferrer">
            <Button variant="default" size="sm">
              <Icons.Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}; 