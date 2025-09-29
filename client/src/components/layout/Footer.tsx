const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold">
            Skill<span className="text-yellow-400 animate-text-glow">Connect</span>
          </h2>
          <p className="max-w-md mx-auto mt-2 text-slate-400">
            Connecting local skills with community needs. Your hyperlocal marketplace for everyday tasks.
          </p>
          <div className="flex justify-center mt-6 space-x-6">
            <a href="#" className="text-slate-300 hover:text-yellow-400 transition-colors duration-300">About Us</a>
            <a href="#" className="text-slate-300 hover:text-yellow-400 transition-colors duration-300">Contact</a>
            <a href="#" className="text-slate-300 hover:text-yellow-400 transition-colors duration-300">Privacy Policy</a>
          </div>
        </div>
        <hr className="h-px my-8 bg-slate-700 border-none" />
        <p className="text-center text-slate-500">
          © {new Date().getFullYear()} SkillConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;