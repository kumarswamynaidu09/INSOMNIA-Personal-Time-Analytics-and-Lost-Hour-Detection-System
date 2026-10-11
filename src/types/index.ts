export type ActivityClassification = 'productive' | 'restorative' | 'routine' | 'recoverable';

export interface ActivityCategory {
  id: string;
  name: string;
  color: string; // hex color code
  icon: string; // lucide icon identifier
  classification: ActivityClassification;
  description: string;
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  categoryId: string;
  startTime: string; // HH:mm (24-hour format)
  endTime: string;   // HH:mm (24-hour format)
  durationMinutes: number; // calculated accurately, handling midnight crossings
  notes?: string;
  isRecoverableFlag?: boolean; // user can explicitly toggle if an activity became a lost hour
  createdAt: string;
}

export interface UserPreferences {
  name: string;
  productiveTargetHours: number; // e.g. 7.0
  sleepTargetHours: number;      // e.g. 7.5
  dailyReviewReminder: boolean;
  reminderTime: string;          // HH:mm, e.g. "21:30"
  weekStartsOn: 'monday' | 'sunday';
  showOverlapsWarning: boolean;
  themeMode: 'stitch-light' | 'stitch-contrast';
}

export interface OverlapConflict {
  activityA: Activity;
  activityB: Activity;
  overlapMinutes: number;
}

export interface DayTimeSummary {
  date: string;
  totalTrackedMinutes: number;
  productiveMinutes: number;
  recoverableMinutes: number;
  restorativeMinutes: number;
  routineMinutes: number;
  untrackedMinutes: number;
  overlapCount: number;
  overlaps: OverlapConflict[];
}

export interface CategoryBreakdown {
  category: ActivityCategory;
  totalMinutes: number;
  percentageOfTracked: number;
  percentageOfDay: number;
  activityCount: number;
}

export type NavigationTab = 'home' | 'timeline' | 'lost-hours' | 'profile';
