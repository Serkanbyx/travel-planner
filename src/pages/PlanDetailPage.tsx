import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { addDays, format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Download,
  FileText,
  FileJson,
  FileType,
  Info,
  Pencil,
  CalendarPlus,
} from 'lucide-react';
import { useTravelStore } from '@/store/useTravelStore';
import { Activity, ActivityFormData, PlanFormData } from '@/types';
import { Layout } from '@/components/layout/Layout';
import { DayColumn } from '@/components/activities/DayColumn';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { ActivityForm } from '@/components/activities/ActivityForm';
import { CreatePlanDialog } from '@/components/plans/CreatePlanDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/useToast';
import { fetchCitySummary } from '@/services/wikipedia';
import { fetchCityImage, getCityGradient } from '@/services/unsplash';
import { exportAsJson, exportAsText, exportAsHtml } from '@/services/export';

/**
 * Page displaying a single travel plan with daily itinerary
 */
export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getPlan,
    updatePlan,
    editPlan,
    addDay,
    removeDay,
    addActivity,
    updateActivity,
    deleteActivity,
    moveActivity,
    reorderActivities,
  } = useTravelStore();

  const plan = getPlan(id!);

  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [coverImage, setCoverImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch Wikipedia summary and cover image
  useEffect(() => {
    if (plan && !plan.wikiSummary) {
      fetchCitySummary(plan.city, plan.country).then((data) => {
        if (data?.extract) {
          updatePlan(plan.id, { wikiSummary: data.extract });
        }
      });
    }

    if (plan && !plan.coverImage) {
      fetchCityImage(plan.city).then((url) => {
        if (url) {
          setCoverImage(url);
          updatePlan(plan.id, { coverImage: url });
        }
      });
    } else if (plan?.coverImage) {
      setCoverImage(plan.coverImage);
    }
  }, [plan, updatePlan]);

  if (!plan) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
          <p className="text-muted-foreground mb-6">
            The travel plan you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/plans">Back to Plans</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'activity') {
      setActiveActivity(activeData.activity);
    }
  };

  // Resolve the day id that currently contains the given activity id.
  const findDayIdByActivity = (activityId: string) =>
    plan.days.find((day) => day.activities.some((a) => a.id === activityId))?.id;

  // While dragging, only handle moving an activity into a *different* day so it
  // visually lands in the target column. Reordering within a day is deferred to
  // drag end to avoid excessive store updates.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type !== 'activity') return;

    const activeId = active.id as string;
    const activeDayId = findDayIdByActivity(activeId);
    if (!activeDayId) return;

    const overDayId =
      overData?.type === 'day'
        ? overData.day.id
        : findDayIdByActivity(over.id as string);

    if (!overDayId || overDayId === activeDayId) return;

    const targetDay = plan.days.find((d) => d.id === overDayId);
    const overIndex =
      overData?.type === 'activity'
        ? targetDay?.activities.findIndex((a) => a.id === over.id) ?? 0
        : targetDay?.activities.length ?? 0;

    moveActivity(plan.id, activeDayId, overDayId, activeId, overIndex);
  };

  // Finalize the drag: reorder within the same day once the user drops.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveActivity(null);

    if (!over || active.id === over.id) return;
    if (over.data.current?.type !== 'activity') return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeDayId = findDayIdByActivity(activeId);
    const overDayId = findDayIdByActivity(overId);

    if (activeDayId && activeDayId === overDayId) {
      reorderActivities(plan.id, activeDayId, activeId, overId);
    }
  };

  // Activity handlers
  const handleAddActivity = (dayId: string) => {
    setSelectedDayId(dayId);
    setEditingActivity(null);
    setActivityFormOpen(true);
  };

  const handleEditActivity = (dayId: string, activity: Activity) => {
    setSelectedDayId(dayId);
    setEditingActivity(activity);
    setActivityFormOpen(true);
  };

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    deleteActivity(plan.id, dayId, activityId);
    toast({
      title: 'Activity deleted',
      description: 'The activity has been removed from your itinerary.',
    });
  };

  const handleActivitySubmit = (data: ActivityFormData) => {
    if (!selectedDayId) return;

    if (editingActivity) {
      updateActivity(plan.id, selectedDayId, editingActivity.id, data);
      toast({
        title: 'Activity updated',
        description: 'Your changes have been saved.',
      });
    } else {
      addActivity(plan.id, selectedDayId, data);
      toast({
        title: 'Activity added',
        description: 'New activity has been added to your itinerary.',
      });
    }
  };

  // Export handlers
  const handleExportJson = () => {
    exportAsJson(plan);
    toast({ title: 'Exported', description: 'Plan exported as JSON file.' });
  };

  const handleExportText = () => {
    exportAsText(plan);
    toast({ title: 'Exported', description: 'Plan exported as text file.' });
  };

  const handleExportHtml = () => {
    exportAsHtml(plan);
    toast({
      title: 'Exported',
      description: 'Plan exported as HTML file. You can print it as PDF.',
    });
  };

  // Day handlers
  const handleAddDay = () => {
    const lastDay = plan.days[plan.days.length - 1];
    const nextDate = lastDay
      ? addDays(parseISO(lastDay.date), 1)
      : parseISO(plan.startDate);
    addDay(plan.id, format(nextDate, 'yyyy-MM-dd'));
    toast({ title: 'Day added', description: 'A new day was added to your itinerary.' });
  };

  const handleRemoveDay = (dayId: string) => {
    removeDay(plan.id, dayId);
    toast({ title: 'Day removed', description: 'The day was removed from your itinerary.' });
  };

  // Plan edit handler
  const handleEditPlan = (data: PlanFormData) => {
    editPlan(plan.id, data);
    toast({ title: 'Plan updated', description: 'Your trip details have been saved.' });
  };

  const editInitialData: PlanFormData = {
    city: plan.city,
    country: plan.country,
    description: plan.description,
    startDate: parseISO(plan.startDate),
    endDate: parseISO(plan.endDate),
  };

  const gradient = getCityGradient(plan.city);
  const selectedDay = plan.days.find((d) => d.id === selectedDayId);

  return (
    <Layout>
      {/* Hero Section */}
      <div
        className="relative h-64 md:h-80 overflow-hidden"
        style={{
          background: !imageLoaded ? gradient : undefined,
        }}
      >
        {coverImage && (
          <img
            src={coverImage}
            alt={`${plan.city} cover`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="container relative h-full flex flex-col justify-end pb-8">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 text-white hover:bg-white/20"
            onClick={() => navigate('/plans')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {plan.city}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {plan.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(plan.startDate), 'MMM d')} -{' '}
                  {format(new Date(plan.endDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setEditPlanOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportHtml}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as HTML (Printable)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportText}>
                  <FileType className="h-4 w-4 mr-2" />
                  Export as Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Wikipedia Summary */}
      {plan.wikiSummary && (
        <div className="container py-6">
          <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">About {plan.city}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {plan.wikiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary */}
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Daily Itinerary</h2>
            <p className="text-muted-foreground">
              Drag and drop activities to reorganize your schedule
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {plan.days.length} days •{' '}
            {plan.days.reduce((sum, day) => sum + day.activities.length, 0)}{' '}
            activities
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {plan.days.map((day, index) => (
              <DayColumn
                key={day.id}
                day={day}
                dayIndex={index}
                onAddActivity={handleAddActivity}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onRemoveDay={plan.days.length > 1 ? handleRemoveDay : undefined}
              />
            ))}

            <div className="flex-shrink-0 flex items-center">
              <Button
                variant="outline"
                onClick={handleAddDay}
                className="h-full min-h-[200px] w-32 border-dashed flex flex-col gap-2"
              >
                <CalendarPlus className="h-6 w-6" />
                Add Day
              </Button>
            </div>
          </div>

          <DragOverlay>
            {activeActivity && (
              <div className="rotate-3 scale-105">
                <ActivityCard
                  activity={activeActivity}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Activity Form Dialog */}
      <ActivityForm
        open={activityFormOpen}
        onOpenChange={setActivityFormOpen}
        onSubmit={handleActivitySubmit}
        activity={editingActivity}
        dayDate={selectedDay?.date}
      />

      {/* Edit Plan Dialog */}
      <CreatePlanDialog
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
        onSubmit={handleEditPlan}
        initialData={editInitialData}
      />
    </Layout>
  );
}
