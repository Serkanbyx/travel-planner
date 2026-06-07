import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TravelPlan, Day, Activity, PlanFormData, ActivityFormData } from '@/types';
import { generateId } from '@/lib/utils';
import { eachDayOfInterval, format } from 'date-fns';

interface TravelState {
  plans: TravelPlan[];
  
  // Plan actions
  addPlan: (data: PlanFormData) => string;
  updatePlan: (id: string, data: Partial<TravelPlan>) => void;
  editPlan: (id: string, data: PlanFormData) => void;
  deletePlan: (id: string) => void;
  getPlan: (id: string) => TravelPlan | undefined;
  importPlan: (plan: TravelPlan) => string;
  
  // Day actions
  addDay: (planId: string, date: string) => void;
  removeDay: (planId: string, dayId: string) => void;
  
  // Activity actions
  addActivity: (planId: string, dayId: string, data: ActivityFormData) => void;
  updateActivity: (planId: string, dayId: string, activityId: string, data: Partial<Activity>) => void;
  deleteActivity: (planId: string, dayId: string, activityId: string) => void;
  moveActivity: (
    planId: string,
    sourceDayId: string,
    targetDayId: string,
    activityId: string,
    newIndex: number
  ) => void;
  reorderActivities: (planId: string, dayId: string, activeId: string, overId: string) => void;
}

// Builds an ordered list of empty days for the given date range.
function buildDays(startDate: Date, endDate: Date): Day[] {
  return eachDayOfInterval({ start: startDate, end: endDate }).map((date) => ({
    id: generateId(),
    date: format(date, 'yyyy-MM-dd'),
    activities: [],
  }));
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      plans: [],

      // Create a new travel plan
      addPlan: (data: PlanFormData) => {
        const id = generateId();
        const now = new Date().toISOString();

        const days = buildDays(data.startDate, data.endDate);

        const newPlan: TravelPlan = {
          id,
          city: data.city,
          country: data.country,
          description: data.description,
          startDate: format(data.startDate, 'yyyy-MM-dd'),
          endDate: format(data.endDate, 'yyyy-MM-dd'),
          days,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          plans: [...state.plans, newPlan],
        }));

        return id;
      },

      // Update an existing plan
      updatePlan: (id: string, data: Partial<TravelPlan>) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id
              ? { ...plan, ...data, updatedAt: new Date().toISOString() }
              : plan
          ),
        }));
      },

      // Edit a plan's core details, reconciling days when the date range
      // changes. Activities on dates that remain in range are preserved.
      editPlan: (id: string, data: PlanFormData) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== id) return plan;

            const newDates = buildDays(data.startDate, data.endDate).map(
              (day) => day.date
            );
            const existingByDate = new Map(
              plan.days.map((day) => [day.date, day])
            );

            const days: Day[] = newDates.map(
              (date) =>
                existingByDate.get(date) ?? {
                  id: generateId(),
                  date,
                  activities: [],
                }
            );

            return {
              ...plan,
              city: data.city,
              country: data.country,
              description: data.description,
              startDate: format(data.startDate, 'yyyy-MM-dd'),
              endDate: format(data.endDate, 'yyyy-MM-dd'),
              days,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Delete a plan
      deletePlan: (id: string) => {
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== id),
        }));
      },

      // Get a specific plan
      getPlan: (id: string) => {
        return get().plans.find((plan) => plan.id === id);
      },

      // Import a plan (e.g. from a JSON backup) with fresh identifiers to
      // avoid collisions with existing plans.
      importPlan: (plan: TravelPlan) => {
        const id = generateId();
        const now = new Date().toISOString();

        const importedPlan: TravelPlan = {
          ...plan,
          id,
          days: plan.days.map((day) => ({
            ...day,
            id: generateId(),
            activities: day.activities.map((activity) => ({
              ...activity,
              id: generateId(),
            })),
          })),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          plans: [...state.plans, importedPlan],
        }));

        return id;
      },

      // Add a new day to a plan
      addDay: (planId: string, date: string) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            
            const newDay: Day = {
              id: generateId(),
              date,
              activities: [],
            };

            return {
              ...plan,
              days: [...plan.days, newDay].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Remove a day from a plan
      removeDay: (planId: string, dayId: string) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            return {
              ...plan,
              days: plan.days.filter((day) => day.id !== dayId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Add an activity to a day
      addActivity: (planId: string, dayId: string, data: ActivityFormData) => {
        const newActivity: Activity = {
          id: generateId(),
          ...data,
        };

        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            return {
              ...plan,
              days: plan.days.map((day) => {
                if (day.id !== dayId) return day;
                // Sort activities by time
                const activities = [...day.activities, newActivity].sort((a, b) =>
                  a.time.localeCompare(b.time)
                );
                return { ...day, activities };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Update an activity
      updateActivity: (planId: string, dayId: string, activityId: string, data: Partial<Activity>) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            return {
              ...plan,
              days: plan.days.map((day) => {
                if (day.id !== dayId) return day;
                const activities = day.activities
                  .map((activity) =>
                    activity.id === activityId ? { ...activity, ...data } : activity
                  )
                  .sort((a, b) => a.time.localeCompare(b.time));
                return { ...day, activities };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Delete an activity
      deleteActivity: (planId: string, dayId: string, activityId: string) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            return {
              ...plan,
              days: plan.days.map((day) => {
                if (day.id !== dayId) return day;
                return {
                  ...day,
                  activities: day.activities.filter((a) => a.id !== activityId),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Move activity between days
      moveActivity: (planId, sourceDayId, targetDayId, activityId, newIndex) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;

            let movedActivity: Activity | null = null;

            // First, find and remove the activity from source day
            const daysAfterRemoval = plan.days.map((day) => {
              if (day.id !== sourceDayId) return day;
              const activity = day.activities.find((a) => a.id === activityId);
              if (activity) movedActivity = activity;
              return {
                ...day,
                activities: day.activities.filter((a) => a.id !== activityId),
              };
            });

            if (!movedActivity) return plan;

            // Then, add the activity to target day
            const daysAfterInsertion = daysAfterRemoval.map((day) => {
              if (day.id !== targetDayId) return day;
              const activities = [...day.activities];
              activities.splice(newIndex, 0, movedActivity!);
              return { ...day, activities };
            });

            return {
              ...plan,
              days: daysAfterInsertion,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // Reorder activities within a day
      reorderActivities: (planId, dayId, activeId, overId) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            return {
              ...plan,
              days: plan.days.map((day) => {
                if (day.id !== dayId) return day;
                
                const oldIndex = day.activities.findIndex((a) => a.id === activeId);
                const newIndex = day.activities.findIndex((a) => a.id === overId);
                
                if (oldIndex === -1 || newIndex === -1) return day;
                
                const activities = [...day.activities];
                const [removed] = activities.splice(oldIndex, 1);
                activities.splice(newIndex, 0, removed);
                
                return { ...day, activities };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'travel-planner-storage',
    }
  )
);
