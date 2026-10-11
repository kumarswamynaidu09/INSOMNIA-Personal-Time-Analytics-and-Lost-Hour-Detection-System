import { Activity, ActivityCategory, DayTimeSummary, OverlapConflict, CategoryBreakdown } from '../types';

/**
 * Converts "HH:MM" string to minutes from start of day (0 to 1439).
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes (0 to 1439) to "HH:MM" 24h format.
 */
export function minutesToTimeString(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Formats 24h "HH:MM" to readable 12h format "h:mm a" or "12:00 AM".
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = (h >= 12 && h < 24) ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculates duration in minutes from startTime to endTime.
 * If endTime <= startTime, assumes the activity spans past midnight into the next day.
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);

  if (endMin > startMin) {
    return endMin - startMin;
  } else if (endMin < startMin) {
    // Crosses midnight (e.g. 23:00 to 07:00 => 60 + 420 = 480 mins)
    return (1440 - startMin) + endMin;
  } else {
    // If start == end, treat as 0 or 24h depending on context. Default to 0 unless specified.
    return 0;
  }
}

/**
 * Formats duration in minutes into clean "Xh Ym" or "Xm".
 */
export function formatMinutes(minutes: number, showZeros = false): string {
  if (minutes <= 0 && !showZeros) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formats decimal hours into "X.Xh"
 */
export function formatDecimalHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

/**
 * Normalizes intervals for a day.
 * For activities that cross midnight, it returns the segment on that calendar day [startMin, 1440].
 * (The remaining portion starts at 00:00 on the following day if tracked there).
 */
export function getActivityDayInterval(activity: Activity): { start: number; end: number; crossesMidnight: boolean } {
  const start = timeStringToMinutes(activity.startTime);
  const end = timeStringToMinutes(activity.endTime);

  if (end > start) {
    return { start, end, crossesMidnight: false };
  } else {
    return { start, end: 1440, crossesMidnight: true };
  }
}

/**
 * Detects overlapping activities for a given day.
 */
export function detectOverlaps(activities: Activity[]): OverlapConflict[] {
  const conflicts: OverlapConflict[] = [];
  const sorted = [...activities].sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  for (let i = 0; i < sorted.length; i++) {
    const actA = sorted[i];
    const intA = getActivityDayInterval(actA);

    for (let j = i + 1; j < sorted.length; j++) {
      const actB = sorted[j];
      const intB = getActivityDayInterval(actB);

      // Check overlap
      const overlapStart = Math.max(intA.start, intB.start);
      const overlapEnd = Math.min(intA.end, intB.end);

      if (overlapEnd > overlapStart) {
        conflicts.push({
          activityA: actA,
          activityB: actB,
          overlapMinutes: overlapEnd - overlapStart,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Calculates union of intervals to avoid double-counting tracked time when calculating untracked time.
 */
export function calculateUnionMinutes(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  const intervals = activities
    .map(a => getActivityDayInterval(a))
    .sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];

  for (const curr of intervals) {
    if (merged.length === 0) {
      merged.push({ start: curr.start, end: curr.end });
      continue;
    }
    const last = merged[merged.length - 1];
    if (curr.start <= last.end) {
      last.end = Math.max(last.end, curr.end);
    } else {
      merged.push({ start: curr.start, end: curr.end });
    }
  }

  return merged.reduce((sum, int) => sum + (int.end - int.start), 0);
}

/**
 * Calculates full daily summary.
 */
export function calculateDaySummary(
  date: string,
  activities: Activity[],
  categories: ActivityCategory[]
): DayTimeSummary {
  const dayActivities = activities.filter(a => a.date === date);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  let productiveMinutes = 0;
  let recoverableMinutes = 0;
  let restorativeMinutes = 0;
  let routineMinutes = 0;

  for (const act of dayActivities) {
    const cat = categoryMap.get(act.categoryId);
    const duration = act.durationMinutes;

    // Check if user explicitly flagged activity as recoverable
    if (act.isRecoverableFlag) {
      recoverableMinutes += duration;
      continue;
    }

    if (!cat) {
      routineMinutes += duration;
      continue;
    }

    switch (cat.classification) {
      case 'productive':
        productiveMinutes += duration;
        break;
      case 'recoverable':
        recoverableMinutes += duration;
        break;
      case 'restorative':
        restorativeMinutes += duration;
        break;
      case 'routine':
      default:
        routineMinutes += duration;
        break;
    }
  }

  const unionMinutes = calculateUnionMinutes(dayActivities);
  const totalTrackedMinutes = productiveMinutes + recoverableMinutes + restorativeMinutes + routineMinutes;
  
  // Total day is 1440 minutes (24 hours). Untracked = 1440 - union of tracked time (capped between 0 and 1440)
  const untrackedMinutes = Math.max(0, 1440 - unionMinutes);
  const overlaps = detectOverlaps(dayActivities);

  return {
    date,
    totalTrackedMinutes,
    productiveMinutes,
    recoverableMinutes,
    restorativeMinutes,
    routineMinutes,
    untrackedMinutes,
    overlapCount: overlaps.length,
    overlaps,
  };
}

/**
 * Calculates category-by-category breakdown for a set of activities.
 */
export function calculateCategoryBreakdowns(
  activities: Activity[],
  categories: ActivityCategory[]
): CategoryBreakdown[] {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const totals = new Map<string, { minutes: number; count: number }>();

  let sumTracked = 0;

  for (const act of activities) {
    const dur = act.durationMinutes;
    sumTracked += dur;
    const existing = totals.get(act.categoryId) || { minutes: 0, count: 0 };
    totals.set(act.categoryId, {
      minutes: existing.minutes + dur,
      count: existing.count + 1,
    });
  }

  const result: CategoryBreakdown[] = [];

  for (const [catId, stat] of totals.entries()) {
    const category = categoryMap.get(catId);
    if (!category) continue;

    result.push({
      category,
      totalMinutes: stat.minutes,
      percentageOfTracked: sumTracked > 0 ? (stat.minutes / sumTracked) * 100 : 0,
      percentageOfDay: (stat.minutes / 1440) * 100,
      activityCount: stat.count,
    });
  }

  // Sort descending by total minutes
  return result.sort((a, b) => b.totalMinutes - a.totalMinutes);
}

/**
 * Generates an array of 24 hourly segments [0..23] for the 24-hour radial allocation clock.
 * Each hour (0-23) is evaluated for dominant activity classification or split.
 */
export interface HourSegment {
  hour: number; // 0 to 23
  label: string; // "00:00", "01:00", etc.
  dominantClassification: 'productive' | 'recoverable' | 'restorative' | 'routine' | 'untracked';
  activitiesInHour: Activity[];
}

export function get24HourAllocation(
  activities: Activity[],
  categories: ActivityCategory[]
): HourSegment[] {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const segments: HourSegment[] = [];

  for (let h = 0; h < 24; h++) {
    const hourStart = h * 60;
    const hourEnd = (h + 1) * 60;

    // Find all activities that overlap with this hour
    const matching: { act: Activity; minutesInThisHour: number; classification: string }[] = [];

    for (const act of activities) {
      const int = getActivityDayInterval(act);
      const overlapStart = Math.max(hourStart, int.start);
      const overlapEnd = Math.min(hourEnd, int.end);

      if (overlapEnd > overlapStart) {
        const cat = categoryMap.get(act.categoryId);
        const classification = act.isRecoverableFlag
          ? 'recoverable'
          : (cat ? cat.classification : 'routine');

        matching.push({
          act,
          minutesInThisHour: overlapEnd - overlapStart,
          classification,
        });
      }
    }

    let dominantClassification: 'productive' | 'recoverable' | 'restorative' | 'routine' | 'untracked' = 'untracked';

    if (matching.length > 0) {
      // Find the classification with maximum minutes in this hour
      const classScores: Record<string, number> = {};
      matching.forEach(m => {
        classScores[m.classification] = (classScores[m.classification] || 0) + m.minutesInThisHour;
      });

      let maxMin = 0;
      for (const [cls, mins] of Object.entries(classScores)) {
        if (mins > maxMin) {
          maxMin = mins;
          dominantClassification = cls as any;
        }
      }
    }

    segments.push({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      dominantClassification,
      activitiesInHour: matching.map(m => m.act),
    });
  }

  return segments;
}

/**
 * Calculates 7-day stats ending on `anchorDate`.
 */
export function getPast7DaysStats(
  anchorDate: string,
  activities: Activity[],
  categories: ActivityCategory[]
) {
  const days: { date: string; label: string; shortDay: string; summary: DayTimeSummary }[] = [];
  const anchor = new Date(`${anchorDate}T12:00:00`);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const summary = calculateDaySummary(dateStr, activities, categories);
    days.push({
      date: dateStr,
      label,
      shortDay,
      summary,
    });
  }

  const totalProductiveMin = days.reduce((acc, d) => acc + d.summary.productiveMinutes, 0);
  const totalRecoverableMin = days.reduce((acc, d) => acc + d.summary.recoverableMinutes, 0);
  const totalRestorativeMin = days.reduce((acc, d) => acc + d.summary.restorativeMinutes, 0);
  const totalRoutineMin = days.reduce((acc, d) => acc + d.summary.routineMinutes, 0);
  const totalUntrackedMin = days.reduce((acc, d) => acc + d.summary.untrackedMinutes, 0);

  const avgProductiveMin = Math.round(totalProductiveMin / 7);
  const avgRecoverableMin = Math.round(totalRecoverableMin / 7);

  // Peak lost day
  let peakLostDay = days[0];
  for (const d of days) {
    if (d.summary.recoverableMinutes > peakLostDay.summary.recoverableMinutes) {
      peakLostDay = d;
    }
  }

  return {
    days,
    totalProductiveMin,
    totalRecoverableMin,
    totalRestorativeMin,
    totalRoutineMin,
    totalUntrackedMin,
    avgProductiveMin,
    avgRecoverableMin,
    peakLostDay,
  };
}
