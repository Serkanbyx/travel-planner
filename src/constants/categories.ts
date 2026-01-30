import { ActivityCategory, CategoryConfig } from '@/types';

/**
 * Configuration for activity categories with labels, colors, and icons
 */
export const CATEGORY_CONFIG: Record<ActivityCategory, CategoryConfig> = {
  sightseeing: {
    label: 'Sightseeing',
    color: 'blue',
    icon: 'Camera',
  },
  food: {
    label: 'Food & Dining',
    color: 'orange',
    icon: 'Utensils',
  },
  transport: {
    label: 'Transportation',
    color: 'green',
    icon: 'Car',
  },
  accommodation: {
    label: 'Accommodation',
    color: 'purple',
    icon: 'Bed',
  },
  shopping: {
    label: 'Shopping',
    color: 'pink',
    icon: 'ShoppingBag',
  },
  entertainment: {
    label: 'Entertainment',
    color: 'yellow',
    icon: 'Music',
  },
  other: {
    label: 'Other',
    color: 'gray',
    icon: 'MoreHorizontal',
  },
};

/**
 * List of all activity categories
 */
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'sightseeing',
  'food',
  'transport',
  'accommodation',
  'shopping',
  'entertainment',
  'other',
];
