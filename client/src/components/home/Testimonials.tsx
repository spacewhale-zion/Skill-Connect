import { FaQuoteLeft } from "react-icons/fa";
import React , { useRef }from "react";
import { useOnScreen } from '../../hooks/useOnScreen';

// Single testimonial card with extra props
const TestimonialCard = ({
  quote,
  name,
  role,
  className = "",
  color = "text-yellow-400",
  style = {},
}: {
  quote: string;
  name: string;
  role: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={style}
    className={`relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-slate-700 flex flex-col ${className}`}
  >
    <FaQuoteLeft
      className={`absolute top-6 left-6 text-6xl opacity-10 ${color}`}
    />
    <div className="relative z-10 flex-grow">
      <p className="text-slate-300 italic leading-relaxed">"{quote}"</p>
    </div>
    <div className="relative z-10 mt-6 pt-6 border-t border-slate-700">
      <p className="font-bold text-lg text-white">{name}</p>
      <p className={`text-sm font-semibold ${color}`}>{role}</p>
    </div>
  </div>
);

const Testimonials = () => {
  // Create a ref for the element we want to observe
  const gridRef = useRef<HTMLDivElement>(null);
  // Use the hook to track if the element is on screen
  const isVisible = useOnScreen(gridRef, '-100px');

  return (
    <div className="py-20 bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">What Our Users Say</h2>
           <p className="text-slate-400 mt-2">Stories from our growing community.</p>
        </div>
        {/* Attach the ref to the grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            className={isVisible ? 'fade-in-up' : ''} // Conditionally apply animation
            style={{ animationDelay: isVisible ? '0.1s' : '0s' }} // Stagger the animation
            quote="Found a fantastic gardener in my neighborhood within an hour. The whole process was seamless and secure. Highly recommend!"
            name="Sarah L."
            role="Homeowner"
            color="text-yellow-400"
          />
          <TestimonialCard
            className={isVisible ? 'fade-in-up' : ''} // Conditionally apply animation
            style={{ animationDelay: isVisible ? '0.3s' : '0s' }} // Stagger the animation
            quote="As a freelance plumber, SkillConnect has been a game-changer for finding small jobs in my area. It’s easy to use and I get paid fast."
            name="Mike R."
            role="Plumbing Provider"
            color="text-pink-500"
          />
          <TestimonialCard
            className={isVisible ? 'fade-in-up' : ''} // Conditionally apply animation
            style={{ animationDelay: isVisible ? '0.5s' : '0s' }} // Stagger the animation
            quote="I needed help assembling furniture and found someone perfect for the job. It’s like having a helpful neighbor on demand."
            name="David C."
            role="Task Seeker"
            color="text-sky-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Testimonials;