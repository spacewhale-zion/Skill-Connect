const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg">
    <p className="text-gray-600 italic">"{quote}"</p>
    <div className="mt-4">
      <p className="font-bold text-gray-800">{name}</p>
      <p className="text-sm text-indigo-500">{role}</p>
    </div>
  </div>
);

const Testimonials = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">What Our Users Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Found a fantastic gardener in my neighborhood within an hour. The whole process was seamless and secure. Highly recommend!"
            name="Sarah L."
            role="Homeowner"
          />
          <TestimonialCard
            quote="As a freelance plumber, SkillConnect has been a game-changer for finding small jobs in my area. It’s easy to use and I get paid fast."
            name="Mike R."
            role="Plumbing Provider"
          />
          <TestimonialCard
            quote="I needed help assembling furniture and found someone perfect for the job. It’s like having a helpful neighbor on demand."
            name="David C."
            role="Task Seeker"
          />
        </div>
      </div>
    </div>
  );
};

export default Testimonials;