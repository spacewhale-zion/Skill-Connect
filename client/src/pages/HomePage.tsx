import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';

import Showcase from '@/components/home/Showcase';

const HomePage = () => {
  return (
    <div>
 
        <canvas id="bg" className="absolute top-0 left-0 w-full h-full"></canvas>
      <main>
        <Hero />
        <Showcase /> 
        <Features />
        <Testimonials />
      </main>
    </div>
  );
};

export default HomePage;