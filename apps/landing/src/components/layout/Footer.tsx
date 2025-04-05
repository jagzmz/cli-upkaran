import React from 'react';
import { Icons } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary/50 py-12 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icons.Terminal className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">cli-upkaran</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A modular and extensible command-line interface (CLI) toolkit built with Node.js.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Documentation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Plugins
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Examples
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Community</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Contributors
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Get Started</h3>
            <div className="space-y-4">
              <a href="#getting-started">
                <Button className="w-full" size="sm">
                  Install Now
                </Button>
              </a>
              <a href="https://github.com/your-org/cli-upkaran" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full" size="sm">
                  <Icons.Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} cli-upkaran. Released under the MIT License.
          </p>
          
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Icons.Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Icons.Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Icons.MessageSquare className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 