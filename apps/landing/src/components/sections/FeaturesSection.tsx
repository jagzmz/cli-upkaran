import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Icons } from '@/components/ui/icon';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, index }) => {
  return (
    <div 
      className={`feature-card p-6 border rounded-lg bg-card transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1`} 
      data-index={index}
    >
      <div className="feature-icon h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="feature-title text-xl font-medium mb-2">{title}</h3>
      <p className="feature-description text-muted-foreground">{description}</p>
    </div>
  );
};

export const FeaturesSection: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const features = [
    {
      icon: <Icons.Puzzle className="h-6 w-6 text-primary" />,
      title: 'Effortless Extensibility',
      description: 'Easily add new commands or functionality via standalone plugins. cli-upkaran discovers and integrates them seamlessly.'
    },
    {
      icon: <Icons.ListChecks className="h-6 w-6 text-primary" />,
      title: 'Plugin Management',
      description: 'Install, remove, list, and update plugins with simple built-in commands.'
    },
    {
      icon: <Icons.Settings className="h-6 w-6 text-primary" />,
      title: 'Core Engine',
      description: 'Provides a robust foundation for command parsing, help generation, configuration, and plugin lifecycle management.'
    },
    {
      icon: <Icons.Library className="h-6 w-6 text-primary" />,
      title: 'Shared Libraries',
      description: 'Leverage powerful built-in or community-provided libraries (like data adapters/transformers) within your plugins for common tasks.'
    }
  ];
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: '.feature-card',
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.9, 1],
            delay: (el: Element) => {
              const index = parseInt(el.getAttribute('data-index') || '0', 10);
              return index * 150;
            },
            duration: 800,
            easing: 'easeOutExpo'
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    
    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <section id="features" className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-muted/50">
      <div className="container mx-auto" ref={featuresRef}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            cli-upkaran provides a powerful and flexible foundation for building modular command-line tools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 