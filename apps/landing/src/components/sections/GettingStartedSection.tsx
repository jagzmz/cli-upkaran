import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icon';

export const GettingStartedSection: React.FC = () => {
  const startedRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: '.started-content',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: 'easeOutExpo'
          });
          
          anime({
            targets: '.terminal-code',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: 300,
            duration: 800,
            easing: 'easeOutExpo'
          });
          
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    
    if (startedRef.current) {
      observer.observe(startedRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <section id="getting-started" className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-muted/50">
      <div className="container mx-auto" ref={startedRef}>
        <div className="started-content text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            It only takes a few steps to install and start using cli-upkaran.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b flex items-center">
              <div className="flex space-x-2 mr-2">
                <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                <div className="w-3 h-3 rounded-full bg-accent/70"></div>
                <div className="w-3 h-3 rounded-full bg-primary/70"></div>
              </div>
              <span className="text-sm text-muted-foreground font-mono">Terminal</span>
            </div>
            
            <div className="p-6 terminal-code">
              <p className="mb-4 text-sm font-mono text-muted-foreground">
                # Install cli-upkaran globally
              </p>
              <div className="flex items-center mb-6">
                <span className="text-primary mr-2">$</span>
                <code className="font-mono">npm install -g @cli-upkaran/cli</code>
              </div>
              
              <p className="mb-4 text-sm font-mono text-muted-foreground">
                # Check available commands
              </p>
              <div className="flex items-center mb-6">
                <span className="text-primary mr-2">$</span>
                <code className="font-mono">cli-upkaran --help</code>
              </div>
              
              <p className="mb-4 text-sm font-mono text-muted-foreground">
                # List installed plugins
              </p>
              <div className="flex items-center mb-6">
                <span className="text-primary mr-2">$</span>
                <code className="font-mono">cli-upkaran plugins list</code>
              </div>
              
              <p className="mb-4 text-sm font-mono text-muted-foreground">
                # Install a plugin
              </p>
              <div className="flex items-center">
                <span className="text-primary mr-2">$</span>
                <code className="font-mono">cli-upkaran plugins install @cli-upkaran/plugin-example</code>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
            <a href="https://docs.cli-upkaran.dev/getting-started" target="_blank" rel="noopener noreferrer">
              <Button variant="default" size="lg" className="w-full md:w-auto">
                <Icons.BookOpen className="mr-2 h-4 w-4" />
                Read Full Documentation
              </Button>
            </a>
            <a href="https://github.com/your-org/cli-upkaran/tree/main/examples" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full md:w-auto">
                <Icons.Code className="mr-2 h-4 w-4" />
                View Examples
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}; 