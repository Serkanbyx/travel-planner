/**
 * Represents a single activity in the travel plan
 */
export interface Activity {
  id: string;
  title: string;
  description?: string;
  time: string; // Format: "HH:mm"
  duration?: number; // Duration in minutes
  location?: string;
  category: ActivityCategory;
  notes?: string;
}

/**
 * Categories for activities
 */
export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'shopping'
  | 'entertainment'
  | 'other';

/**
 * Represents a single day in the travel plan
 */
export interface Day {
  id: string;
  date: string; // ISO date string
  activities: Activity[];
}

/**
 * Represents a complete travel plan
 */
export interface TravelPlan {
  id: string;
  city: string;
  country: string;
  description?: string;
  coverImage?: string;
  wikiSummary?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  days: Day[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/editing a plan
 */
export interface PlanFormData {
  city: string;
  country: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Form data for creating/editing an activity
 */
export interface ActivityFormData {
  title: string;
  description?: string;
  time: string;
  duration?: number;
  location?: string;
  category: ActivityCategory;
  notes?: string;
}

/**
 * Unsplash API response for images
 */
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
}

/**
 * Wikipedia API response
 */
export interface WikipediaResponse {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
}

/**
 * Category configuration for UI display
 */
export interface CategoryConfig {
  label: string;
  color: string;
  icon: string;
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'pdf' | 'text';
