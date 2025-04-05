import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Icons } from '@/components/ui/icon';

interface UseCaseProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const UseCase: React.FC<UseCaseProps> = ({ icon, title, description, index }) => {
  return (
    <div 
      className="use-case-card flex gap-4 p-6 border rounded-lg bg-card transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1" 
      data-index={index}
    >
      <div className="use-case-icon h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="use-case-title text-xl font-medium mb-2">{title}</h3>
        <p className="use-case-description text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export const UseCasesSection: React.FC = () => {
  const useCasesRef = useRef<HTMLDivElement>(null);
  
  const useCases = [
    {
      icon: <Icons.Database className="h-6 w-6 text-primary" />,
      title: 'Data Processing Pipelines',
      description: 'Standardize fetching, transforming, and loading data from various sources. Create reusable data transformation logic across multiple commands.'
    },
    {
      icon: <Icons.Cloud className="h-6 w-6 text-primary" />,
      title: 'DevOps & Infrastructure',
      description: 'Create consistent commands for deployment, monitoring, or interacting with cloud services. Manage resources across different providers with a unified interface.'
    },
    {
      icon: <Icons.AppWindow className="h-6 w-6 text-primary" />,
      title: 'Internal Platform Tools',
      description: 'Build a unified CLI for interacting with various internal APIs and services. Create a consistent experience for developers across your organization.'
    },
    {
      icon: <Icons.Laptop className="h-6 w-6 text-primary" />,
      title: 'Development Workflow',
      description: "Simplify and automate repetitive development tasks. Create custom commands tailored to your project's specific needs and workflows."
    }
  ];
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: '.use-case-card',
            opacity: [0, 1],
            translateX: [50, 0],
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
    
    if (useCasesRef.current) {
      observer.observe(useCasesRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <section id="use-cases" className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-muted/50">
      <div className="container mx-auto" ref={useCasesRef}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who is cli-upkaran for?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            cli-upkaran is designed for developers who build and maintain command-line tools for various purposes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {useCases.map((useCase, index) => (
            <UseCase
              key={index}
              icon={useCase.icon}
              title={useCase.title}
              description={useCase.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 