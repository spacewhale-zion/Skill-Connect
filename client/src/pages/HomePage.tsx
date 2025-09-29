import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Testimonials from '../components/home/Testimonials';
import Footer from '../components/layout/Footer';
import Showcase from '../components/home/Showcase';

const HomePage = () => {
  return (
    <div>
      <Navbar />
        <canvas id="bg" className="absolute top-0 left-0 w-full h-full"></canvas>
      <main>
        <Hero />
        <Showcase /> 
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;