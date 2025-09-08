const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold">Skill<span className="text-indigo-400">Connect</span></h2>
          <p className="max-w-md mx-auto mt-2 text-gray-400">Connecting local skills with community needs. Your hyperlocal marketplace for everyday tasks.</p>
          <div className="flex justify-center mt-6">
            <a href="#" className="mx-3 hover:text-indigo-400">About Us</a>
            <a href="#" className="mx-3 hover:text-indigo-400">Contact</a>
            <a href="#" className="mx-3 hover:text-indigo-400">Privacy Policy</a>
          </div>
        </div>
        <hr className="h-px my-6 bg-gray-700 border-none" />
        <p className="text-center text-gray-400">
          © {new Date().getFullYear()} SkillConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;