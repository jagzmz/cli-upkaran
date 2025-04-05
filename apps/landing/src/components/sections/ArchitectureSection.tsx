import anime from "animejs";
import { useRef, useEffect } from "react";
import { Icons } from "../ui/icon";


export const ArchitectureSection: React.FC = () => {
  const architectureRef = useRef<HTMLDivElement>(null);
  const animationRan = useRef(false); // Prevent re-running animation on fast scrolls

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Check if intersecting and animation hasn't run yet
        if (entry.isIntersecting && !animationRan.current) {
          animationRan.current = true; // Mark animation as run

          // Animate nodes
          anime({
            targets: '.arch-node',
            scale: [0.5, 1], // Start slightly visible for better perception
            opacity: [0, 1],
            translateY: [20, 0], // Add a slight upward movement
            delay: anime.stagger(150, { start: 100 }), // Add a small start delay
            duration: 600,
            easing: 'easeOutExpo'
          });

          // Animate connections
          anime({
            targets: '.arch-connection',
            strokeDashoffset: [anime.setDashoffset, 0],
            opacity: [0, 1], // Fade in connections as well
            delay: 500, // Start after nodes begin appearing
            duration: 1000,
            easing: 'easeInOutSine' // Use a smoother easing for lines
          });

          observer.disconnect(); // Disconnect after animation starts
        }
      });
    }, { threshold: 0.2 }); // Trigger slightly later when more is visible

    const currentRef = architectureRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      // Reset animation flag if component unmounts (optional, depends on desired behavior)
      // animationRan.current = false;
      anime.remove('.arch-node'); // Clean up animations on unmount
      anime.remove('.arch-connection');
    };
  }, []);

  // --- Node Positions (Percentages for calculation reference) ---
  // Core:      left: 50%, top: 50% (w-32, h-32) -> Center (50%, 50%)
  // CLI:       left: 50%, top: 15% (w-24, h-24) -> Center (50%, 15%)
  // Registry:  left: 5%,  top: 50% (w-24, h-24) -> Approx Center (15%, 50%) adjusted for width
  // Plugins:   left: 5%,  top: 15% (w-24, h-24) -> Approx Center (15%, 15%) adjusted for width
  // Libraries: left: 5%,  top: 85% (w-24, h-24) -> Approx Center (15%, 85%) adjusted for width
  // Adapters:  left: 75%, top: 85% (w-24, h-24) -> Approx Center (85%, 85%) adjusted for width

  // --- Approximate Node Radii (as percentage of 400px height, very rough) ---
  // Large Node (Core, 32 = 128px): ~16% radius vertically
  // Small Node (Others, 24 = 96px): ~12% radius vertically/horizontally (assuming ~800px width for 4xl)

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-background">
      <div className="container mx-auto" ref={architectureRef}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Modular by Design</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            The cli-upkaran architecture allows for easy extensibility through plugins and shared libraries.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto bg-card border rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
          {/* Increased height to give more space */}
          <div className="w-full h-[450px] md:h-[500px] relative">
            {/* --- Nodes --- */}
            {/* Core Engine */}
            <div className="arch-node absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 border border-primary/30 rounded-full flex flex-col items-center justify-center text-center p-2 z-10">
              <Icons.Box className="h-8 w-8 text-primary mb-1" />
              <span className="font-semibold text-sm text-primary-foreground">Core Engine</span>
            </div>

            {/* CLI */}
            <div className="arch-node absolute top-[15%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-secondary/10 border border-secondary/30 rounded-full flex flex-col items-center justify-center text-center p-2 z-10">
              <Icons.Terminal className="h-6 w-6 text-secondary-foreground mb-1" />
              <span className="font-medium text-xs text-secondary-foreground">CLI</span>
            </div>

            {/* Plugin Registry - Adjusted position slightly left */}
            <div className="arch-node absolute top-1/2 left-[15%] transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-accent/10 border border-accent/30 rounded-full flex flex-col items-center justify-center text-center p-2 z-10">
              <Icons.Database className="h-6 w-6 text-accent-foreground mb-1" />
              <span className="font-medium text-xs text-accent-foreground">Plugin Registry</span>
            </div>

            {/* Command Plugins - Aligned above Registry */}
            <div className="arch-node absolute top-[15%] left-[15%] transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-muted/50 border border-muted-foreground/30 rounded-full flex flex-col items-center justify-center text-center p-2 z-10">
              <Icons.Puzzle className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="font-medium text-xs text-muted-foreground">Command Plugins</span>
            </div>

            {/* Supporting Libraries - Moved down slightly */}
            <div className="arch-node absolute top-[85%] left-[15%] transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-muted/50 border border-muted-foreground/30 rounded-full flex flex-col items-center justify-center text-center p-2 z-10">
              <Icons.Library className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="font-medium text-xs text-muted-foreground">Supporting Libraries</span>
            </div>

            {/* Data Adapters - Adjusted position slightly right, moved down slightly */}
            <div className="arch-node absolute top-[85%] left-[85%] transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-muted/50 border border-muted-foreground/30 rounded-full flex flex-col items-center justify-center text-center p-2 z-10">
              <Icons.Database className="h-6 w-6 text-muted-foreground mb-1" /> {/* Consider a different Icon? DatabaseZap? */}
              <span className="font-medium text-xs text-muted-foreground">Data Adapters</span>
            </div>

            {/* --- Connections (SVG) --- */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">
              {/* CLI to Core */}
              {/* From bottom-center of CLI (50%, 15% + ~6%) to top-center of Core (50%, 50% - ~7%) */}
              <line
                x1="50%" y1="22%"
                x2="50%" y2="42%"
                className="arch-connection stroke-muted-foreground/70"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Plugin Registry to Core */}
              {/* From right-center of Registry (15% + ~6%, 50%) to left-center of Core (50% - ~7%, 50%) */}
              <line
                x1="21%" y1="50%"
                x2="42%" y2="50%"
                className="arch-connection stroke-muted-foreground/70"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Command Plugins to Plugin Registry */}
              {/* From bottom-center of Plugins (15%, 15% + ~6%) to top-center of Registry (15%, 50% - ~6%) */}
              <line
                x1="15%" y1="22%"
                x2="15%" y2="43%"
                className="arch-connection stroke-muted-foreground/70"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Core to Supporting Libraries / Data Adapters Junction */}
              {/* From bottom-center of Core (50%, 50% + ~7%) down to the horizontal line level (y=85%) */}
               <line
                x1="50%" y1="58%"
                x2="50%" y2="85%"
                className="arch-connection stroke-muted-foreground/70"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Horizontal line connecting the vertical line to Libs/Adapters */}
              {/* From point near Libs (15% + ~6%, 85%) to point near Adapters (85% - ~6%, 85%) via the central vertical line endpoint (50%, 85%) */}
              {/* Line segment 1: Libs connection point to vertical line */}
              <line
                x1="22%" y1="85%"
                x2="50%" y2="85%"
                className="arch-connection stroke-muted-foreground/70"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Line segment 2: Vertical line to Adapters connection point */}
               <line
                x1="50%" y1="85%"
                x2="78%" y2="85%"
                className="arch-connection stroke-muted-foreground/70"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Explanation Section */}
        <div className="mt-12 md:mt-16 max-w-3xl mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Understanding the Architecture</h3>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start">
              <Icons.ArrowRight className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p>The <span className="font-medium text-foreground">cli-upkaran CLI</span> provides the user interface, parsing commands and passing them to the Core Engine.</p>
            </li>
            <li className="flex items-start">
              <Icons.ArrowRight className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p>The <span className="font-medium text-foreground">Core Engine</span> orchestrates operations, using the <span className="font-medium text-foreground">Plugin Registry</span> to discover and load available commands.</p>
            </li>
            <li className="flex items-start">
              <Icons.ArrowRight className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p><span className="font-medium text-foreground">Command Plugins</span> encapsulate specific functionalities (like 'generate', 'deploy', etc.) and are loaded dynamically by the Core.</p>
            </li>
             <li className="flex items-start">
              <Icons.ArrowRight className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p><span className="font-medium text-foreground">Supporting Libraries</span> offer reusable code (e.g., file utilities, API clients) that can be shared across the Core and Plugins.</p>
            </li>
            <li className="flex items-start">
              <Icons.ArrowRight className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
               <p><span className="font-medium text-foreground">Data Adapters</span> (optional components) handle interactions with specific data sources or external systems, promoting separation of concerns.</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};