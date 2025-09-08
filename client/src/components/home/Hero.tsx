import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
          Your Local Skill Marketplace
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Connect with skilled neighbors to get things done, right away. From plumbing to tutoring, find the help you need, when you need it.
        </p>
        <div className="mt-8">
          <Link
            to="/register"
            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;