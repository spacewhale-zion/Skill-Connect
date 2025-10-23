import { Link } from 'react-router-dom';
import { FaUserLock } from 'react-icons/fa';

const SuspendedPage = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-red-900 via-slate-900 to-slate-900 text-white overflow-hidden">
      {/* Optional: Add background elements like stars */}
      {/* <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-30 z-0"></canvas> */}

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-red-700 text-center">
        <FaUserLock className="mx-auto text-5xl text-red-500 mb-4" />
        <h2 className="text-3xl font-bold text-white">Account Suspended</h2>
        <p className="mt-2 text-slate-300">
          Your account has been temporarily suspended due to a violation of our terms of service or community guidelines.
        </p>
        <p className="mt-4 text-slate-400 text-sm">
          If you believe this is an error, please contact support for assistance. You will not be able to log in or use SkillConnect services until the suspension is lifted.
        </p>
        <div className="mt-6">
          <Link
            to="/" // Link back to the home page or a contact page
            className="inline-block px-6 py-2 font-semibold text-slate-900 bg-slate-400 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Go to Homepage
          </Link>
          <a href="mailto:support@skillconnect.example" className="ml-4 text-yellow-400 hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default SuspendedPage;
