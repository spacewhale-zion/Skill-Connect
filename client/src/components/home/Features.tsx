const FeatureCard = ({ icon, title, children }: { icon: JSX.Element, title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
      {icon}
    </div>
    <h3 className="mt-5 text-xl font-semibold text-gray-800">{title}</h3>
    <p className="mt-2 text-gray-600">{children}</p>
  </div>
);

const Features = () => {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="text-gray-600 mt-2">Find help or offer your skills in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" /></svg>}
            title="1. Post a Task"
          >
            Describe what you need done, set your budget, and post your task for local providers to see.
          </FeatureCard>
          <FeatureCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m6-1v6m0 0v6m0-6h6m-6 0H9" /></svg>}
            title="2. Receive Bids"
          >
            Skilled providers in your area will bid on your task. Compare profiles, ratings, and prices.
          </FeatureCard>
          <FeatureCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            title="3. Get It Done"
          >
            Choose the best provider for the job. Once the task is complete, pay securely through our platform.
          </FeatureCard>
        </div>
      </div>
    </div>
  );
};

export default Features;