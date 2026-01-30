import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { format } from 'date-fns';
import { Plus, Calendar } from 'lucide-react';
import { Day, Activity } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ActivityCard } from './ActivityCard';

interface DayColumnProps {
  day: Day;
  dayIndex: number;
  onAddActivity: (dayId: string) => void;
  onEditActivity: (dayId: string, activity: Activity) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
}

/**
 * Column component for a single day with droppable area
 */
export function DayColumn({
  day,
  dayIndex,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
    data: {
      type: 'day',
      day,
    },
  });

  const activityIds = day.activities.map((a) => a.id);

  return (
    <Card
      className={`flex flex-col min-w-[320px] max-w-[400px] flex-shrink-0 transition-colors ${
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Day {dayIndex + 1}
            </p>
            <CardTitle className="text-lg flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-primary" />
              {format(new Date(day.date), 'EEEE')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(new Date(day.date), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {day.activities.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {day.activities.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-400px)]"
      >
        {day.activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4 border-2 border-dashed border-muted rounded-lg">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No activities planned yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddActivity(day.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Activity
            </Button>
          </div>
        ) : (
          <SortableContext
            items={activityIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {day.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={(a) => onEditActivity(day.id, a)}
                  onDelete={(activityId) => onDeleteActivity(day.id, activityId)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>

      {day.activities.length > 0 && (
        <div className="p-3 pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onAddActivity(day.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </div>
      )}
    </Card>
  );
}
