import React,{useRef} from 'react';
import { useOnScreen } from '../../hooks/useOnScreen';


type FeatureCardProps = {
  icon: JSX.Element;
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // ✅ add this
};

// The Feature Card Component
const FeatureCard = ({ icon, title, children, className, style }: FeatureCardProps) => (
  <div
    style={style} // ✅ now it works
    className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-slate-700 transition-all duration-300 transform hover:-translate-y-2 hover:border-yellow-400 ${className}`}
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full text-slate-900">
      {icon}
    </div>
    <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-slate-400">{children}</p>
  </div>
);


const Features = () => {
  // Create a ref for the element we want to observe
  const gridRef = useRef<HTMLDivElement>(null);
  // Use the hook to track if the element is on screen
  const isVisible = useOnScreen(gridRef, '-100px');

  return (
    <div className="relative bg-slate-900 py-20 overflow-hidden">
      {/* CSS Starfield */}
      <div className="absolute inset-0 z-0"><div id="stars"></div><div id="stars2"></div><div id="stars3"></div></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">How It Works</h2>
          <p className="text-slate-400 mt-2">Find help or offer your skills in three simple steps.</p>
        </div>
        {/* Attach the ref to the grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            className={isVisible ? 'fade-in-up' : ''} // Conditionally apply animation
            icon={<div className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" /></svg></div>}
            title="1. Post a Task"
          >
            Describe what you need, set your budget, and post your task for local providers to see.
          </FeatureCard>
          <FeatureCard
            className={isVisible ? 'fade-in-up' : ''} // Conditionally apply animation
            style={{ animationDelay: isVisible ? '0.2s' : '0s' }} // Stagger the animation
            icon={<div className="flex items-center justify-center h-12 w-12 rounded-full bg-pink-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m6-1v6m0 0v6m0-6h6m-6 0H9" /></svg></div>}
            title="2. Receive Bids"
          >
            Skilled providers in your area will bid on your task. Compare profiles, ratings, and prices.
          </FeatureCard>
          <FeatureCard
            className={isVisible ? 'fade-in-up' : ''} // Conditionally apply animation
            style={{ animationDelay: isVisible ? '0.4s' : '0s' }} // Stagger the animation
            icon={<div className="flex items-center justify-center h-12 w-12 rounded-full bg-sky-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
            title="3. Get It Done"
          >
            Choose the best provider. Once complete, pay securely through our platform.
          </FeatureCard>
        </div>
      </div>
    </div>
  );
};

export default Features;