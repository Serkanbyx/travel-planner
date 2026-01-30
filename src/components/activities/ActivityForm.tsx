import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, ActivityFormData } from '@/types';
import { ACTIVITY_CATEGORIES, CATEGORY_CONFIG } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Validation schema for activity form
const activitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  time: z.string().min(1, 'Time is required'),
  duration: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
  category: z.enum([
    'sightseeing',
    'food',
    'transport',
    'accommodation',
    'shopping',
    'entertainment',
    'other',
  ] as const),
  notes: z.string().optional(),
});

type ActivitySchemaType = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormData) => void;
  activity?: Activity | null;
  dayDate?: string;
}

/**
 * Dialog form for creating/editing activities
 */
export function ActivityForm({
  open,
  onOpenChange,
  onSubmit,
  activity,
  dayDate,
}: ActivityFormProps) {
  const isEditing = !!activity;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivitySchemaType>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      time: '09:00',
      duration: undefined,
      location: '',
      category: 'sightseeing',
      notes: '',
    },
  });

  // Reset form when activity changes or dialog opens
  useEffect(() => {
    if (open) {
      if (activity) {
        reset({
          title: activity.title,
          description: activity.description || '',
          time: activity.time,
          duration: activity.duration,
          location: activity.location || '',
          category: activity.category,
          notes: activity.notes || '',
        });
      } else {
        reset({
          title: '',
          description: '',
          time: '09:00',
          duration: undefined,
          location: '',
          category: 'sightseeing',
          notes: '',
        });
      }
    }
  }, [open, activity, reset]);

  const onFormSubmit = (data: ActivitySchemaType) => {
    onSubmit(data as ActivityFormData);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Activity' : 'Add New Activity'}
            </DialogTitle>
            <DialogDescription>
              {dayDate
                ? `Adding activity for ${new Date(dayDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}`
                : 'Fill in the activity details'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Visit Eiffel Tower"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Time and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  {...register('time')}
                  className={errors.time ? 'border-destructive' : ''}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  placeholder="e.g., 60"
                  {...register('duration')}
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>Category *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_CONFIG[category].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Champ de Mars, Paris"
                {...register('location')}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add details about this activity..."
                {...register('description')}
                rows={2}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? 'Saving...'
                  : 'Adding...'
                : isEditing
                ? 'Save Changes'
                : 'Add Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
