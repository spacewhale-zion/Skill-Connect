// client/src/components/layout/LoadingSpinner.tsx

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="cosmic-loader"></div>
      <p className="text-slate-400 text-lg font-medium">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;