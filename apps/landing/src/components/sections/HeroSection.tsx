import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icon';

export const HeroSection: React.FC = () => {
  const animationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (animationRef.current) {
      const timeline = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
      });
      
      timeline
        .add({
          targets: '.hero-title .word',
          opacity: [0, 1],
          translateY: [20, 0],
          rotate: [5, 0],
          delay: (_el: Element, i: number) => 150 * i
        })
        .add({
          targets: '.hero-subtitle',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800
        }, '-=600')
        .add({
          targets: '.hero-cta',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800
        }, '-=600');
    }
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 text-center" ref={animationRef}>
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight hero-title">
            {['Build', 'Powerful,', 'Modular', 'CLIs', 'Effortlessly'].map((word, index) => (
              <span key={index} className="word inline-block mr-2 md:mr-4">{word}</span>
            ))}
          </h1>
          <p className="text-xl text-muted-foreground hero-subtitle max-w-3xl mx-auto">
            A flexible Node.js framework for creating and managing powerful, plugin-based command-line tools. 
            Stop reinventing the wheel, start building.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 hero-cta justify-center">
            <a href="#getting-started">
              <Button size="lg" className="w-full sm:w-auto">
                <Icons.Download className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </a>
            <a href="https://github.com/your-org/cli-upkaran" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Icons.Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}; 