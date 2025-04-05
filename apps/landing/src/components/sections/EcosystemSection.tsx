import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icon';

export const EcosystemSection: React.FC = () => {
  const ecosystemRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: '.ecosystem-card',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: anime.stagger(150),
            duration: 800,
            easing: 'easeOutExpo'
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    
    if (ecosystemRef.current) {
      observer.observe(ecosystemRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <section id="ecosystem" className="py-16 md:py-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto" ref={ecosystemRef}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Extend Your Toolkit</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            cli-upkaran is designed with extensibility in mind. Create your own plugins or use community-built ones.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="ecosystem-card p-6 border rounded-lg bg-card transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mb-4">
              <Icons.Puzzle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-3">Creating Command Plugins</h3>
            <p className="text-muted-foreground mb-6">
              Command plugins are simple Node.js packages that export a <code className="bg-muted px-1 py-0.5 rounded text-sm">registerCommands</code> 
              function. They can be published to npm, making them shareable across your team or the community.
            </p>
            <div className="bg-muted p-4 rounded-md mb-6 overflow-x-auto">
              <pre className="text-sm">
                <code>
{`export function registerCommands(program) {
  program
    .command('hello')
    .description('Say hello')
    .action(() => {
      console.log('Hello from my plugin!');
    });
}`}
                </code>
              </pre>
            </div>
            <a href="#" className="inline-flex items-center text-primary hover:underline">
              <span>View Plugin Development Guide</span>
              <Icons.ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          
          <div className="ecosystem-card p-6 border rounded-lg bg-card transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mb-4">
              <Icons.Library className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-3">Creating Supporting Libraries</h3>
            <p className="text-muted-foreground mb-6">
              Supporting libraries extend core capabilities like adding new data sources for 
              <code className="bg-muted px-1 py-0.5 rounded text-sm ml-1">dataprep-core</code>. 
              These libraries can be used by multiple plugins to provide common functionality.
            </p>
            <div className="bg-muted p-4 rounded-md mb-6 overflow-x-auto">
              <pre className="text-sm">
                <code>
{`export class MyCustomAdapter extends BaseAdapter {
  async connect(config) {
    // Connect to your data source
  }
  
  async getData(query) {
    // Fetch and return data
  }
}`}
                </code>
              </pre>
            </div>
            <a href="#" className="inline-flex items-center text-primary hover:underline">
              <span>View Library Development Guide</span>
              <Icons.ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a href="https://github.com/your-org/cli-upkaran/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">
            <Button size="lg">
              <Icons.Github className="mr-2 h-4 w-4" />
              Become a Contributor
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}; 