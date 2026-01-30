import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Camera,
  Utensils,
  Car,
  Bed,
  ShoppingBag,
  Music,
  MoreHorizontal,
} from 'lucide-react';
import { Activity, ActivityCategory } from '@/types';
import { formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

// Category icons mapping
const categoryIcons: Record<ActivityCategory, typeof Camera> = {
  sightseeing: Camera,
  food: Utensils,
  transport: Car,
  accommodation: Bed,
  shopping: ShoppingBag,
  entertainment: Music,
  other: MoreHorizontal,
};

/**
 * Draggable activity card component
 */
export function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: activity.id,
    data: {
      type: 'activity',
      activity,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const CategoryIcon = categoryIcons[activity.category];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-3 transition-all ${
        isDragging ? 'opacity-50 shadow-lg scale-105 z-50' : 'hover:shadow-md'
      }`}
    >
      {/* Drag Handle */}
      <button
        className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Time */}
      <div className="flex-shrink-0 w-16 text-center">
        <p className="text-sm font-semibold text-primary">
          {formatTime(activity.time)}
        </p>
        {activity.duration && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {activity.duration} min
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{activity.title}</h4>
            
            {activity.location && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{activity.location}</span>
              </p>
            )}
            
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>

          {/* Actions - visible on hover */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(activity)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(activity.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={activity.category} className="flex items-center gap-1">
            <CategoryIcon className="h-3 w-3" />
            {activity.category}
          </Badge>
          
          {activity.notes && (
            <span className="text-xs text-muted-foreground italic truncate">
              Note: {activity.notes}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
