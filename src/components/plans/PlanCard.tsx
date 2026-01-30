import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Trash2, MoreVertical } from 'lucide-react';
import { TravelPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchCityImage, getCityGradient } from '@/services/unsplash';

interface PlanCardProps {
  plan: TravelPlan;
  onDelete: (id: string) => void;
}

/**
 * Card component displaying a travel plan summary
 */
export function PlanCard({ plan, onDelete }: PlanCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(plan.coverImage || '');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const totalActivities = plan.days.reduce(
    (sum, day) => sum + day.activities.length,
    0
  );

  // Fetch city image if not already set
  useEffect(() => {
    if (!plan.coverImage && !imageUrl) {
      fetchCityImage(plan.city).then((url) => {
        if (url) setImageUrl(url);
      });
    }
  }, [plan.city, plan.coverImage, imageUrl]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(plan.id);
  };

  const gradient = getCityGradient(plan.city);

  return (
    <Link to={`/plan/${plan.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        {/* Cover Image */}
        <div
          className="relative h-48 overflow-hidden"
          style={{
            background: !imageLoaded || imageError ? gradient : undefined,
          }}
        >
          {imageUrl && !imageError && (
            <img
              src={imageUrl}
              alt={`${plan.city} cover`}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* City Name */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">
              {plan.city}
            </h3>
            <p className="flex items-center gap-1 text-white/90 text-sm">
              <MapPin className="h-3 w-3" />
              {plan.country}
            </p>
          </div>

          {/* Actions Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(plan.startDate), 'MMM d')} -{' '}
                {format(new Date(plan.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium text-foreground">{plan.days.length}</span> days
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium text-foreground">{totalActivities}</span> activities
            </span>
          </div>

          {plan.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {plan.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
