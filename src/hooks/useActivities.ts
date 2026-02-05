import { useLocalStorage } from "./useLocalStorage";

export interface Activity {
  id: string;
  title: string;
  date: string;
  status: "Completed" | "Ongoing" | "Pending";
}

const ACTIVITIES_KEY = "edigivault_activities";

export function useActivities() {
  const [activities, setActivities] = useLocalStorage<Activity[]>(ACTIVITIES_KEY, []);

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
    };
    setActivities([newActivity, ...activities]);
    return newActivity;
  };

  const updateActivity = (id: string, updates: Partial<Omit<Activity, "id">>) => {
    setActivities(
      activities.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const getStatusCounts = () => {
    return {
      completed: activities.filter((a) => a.status === "Completed").length,
      ongoing: activities.filter((a) => a.status === "Ongoing").length,
      pending: activities.filter((a) => a.status === "Pending").length,
    };
  };

  return {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    getStatusCounts,
  };
}
