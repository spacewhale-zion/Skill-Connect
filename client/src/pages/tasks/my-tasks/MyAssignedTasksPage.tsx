import { useEffect, useState, useMemo } from "react"; // Import useMemo
import { getMyAssignedTasks } from "@/services/taskServices";
import TaskCard from "@/components/tasks/TaskCard";
import Footer from "@/components/layout/Footer";
import toast from "react-hot-toast";
import type { Task } from "@/types/index";
import LoadingSpinner from "@/components/layout/LoadingSpinner";

const AllMyAssignedTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const assignedTasks = await getMyAssignedTasks();
        setTasks(assignedTasks);
      } catch (error) {
        toast.error("Failed to load your assigned tasks.", {
          id: "error-toast",
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // --- NEW: Sorting logic to prioritize active tasks ---
  const sortedTasks = useMemo(() => {
    const statusOrder: { [key: string]: number } = {
      Assigned: 1,
      CompletedByProvider: 2,
      Completed: 3,
      Cancelled: 4,
    };
    return [...tasks].sort((a, b) => {
      const statusA = statusOrder[a.status] || 99;
      const statusB = statusOrder[b.status] || 99;
      return statusA - statusB;
    });
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen  bg-slate-900 text-white">
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center mb-10">
          Tasks I'm Working On
        </h1>
        {sortedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white">
              No Assigned Tasks
            </h3>
            <p className="text-slate-400 mt-2">
              You haven't been assigned to any tasks yet.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllMyAssignedTasksPage;
