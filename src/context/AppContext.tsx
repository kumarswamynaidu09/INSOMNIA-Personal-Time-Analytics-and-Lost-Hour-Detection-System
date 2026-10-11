import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Activity,
  ActivityCategory,
  UserPreferences,
  NavigationTab,
  DayTimeSummary,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PREFERENCES,
  INITIAL_DEMO_ACTIVITIES,
  STORAGE_KEYS,
} from '../data/defaultData';
import {
  calculateDaySummary,
  calculateDurationMinutes,
  getPast7DaysStats,
} from '../utils/timeCalculations';

interface AppContextType {
  activities: Activity[];
  categories: ActivityCategory[];
  preferences: UserPreferences;
  selectedDate: string;
  activeTab: NavigationTab;
  showWeeklyInsights: boolean;
  isAddModalOpen: boolean;
  activityToEdit: Activity | null;

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedDate: (date: string) => void;
  setShowWeeklyInsights: (show: boolean) => void;
  openAddModal: (act?: Activity | null) => void;
  closeAddModal: () => void;

  addActivity: (actData: {
    date: string;
    title: string;
    categoryId: string;
    startTime: string;
    endTime: string;
    notes?: string;
    isRecoverableFlag?: boolean;
  }) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  updatePreferences: (updates: Partial<UserPreferences>) => void;
  addCategory: (category: Omit<ActivityCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<ActivityCategory>) => void;

  resetToDemoData: () => void;
  clearAllActivities: () => void;
  importData: (imported: { activities?: Activity[]; categories?: ActivityCategory[]; preferences?: UserPreferences }) => boolean;

  // Computed
  daySummary: DayTimeSummary;
  weeklyStats: ReturnType<typeof getPast7DaysStats>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TODAY_DATE = '2026-10-11';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persistent or default state
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading activities from storage', e);
    }
    return INITIAL_DEMO_ACTIVITIES;
  });

  const [categories, setCategories] = useState<ActivityCategory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading categories from storage', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading preferences from storage', e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [showWeeklyInsights, setShowWeeklyInsights] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed saving activities', e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed saving categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed saving preferences', e);
    }
  }, [preferences]);

  // Actions
  const openAddModal = (act?: Activity | null) => {
    setActivityToEdit(act || null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setActivityToEdit(null);
  };

  const addActivity = (actData: {
    date: string;
    title: string;
    categoryId: string;
    startTime: string;
    endTime: string;
    notes?: string;
    isRecoverableFlag?: boolean;
  }) => {
    const duration = calculateDurationMinutes(actData.startTime, actData.endTime);
    const newActivity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: actData.date,
      title: actData.title.trim() || 'Untitled Activity',
      categoryId: actData.categoryId,
      startTime: actData.startTime,
      endTime: actData.endTime,
      durationMinutes: duration,
      notes: actData.notes?.trim() || undefined,
      isRecoverableFlag: actData.isRecoverableFlag,
      createdAt: new Date().toISOString(),
    };

    setActivities(prev => [newActivity, ...prev]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev =>
      prev.map(act => {
        if (act.id !== id) return act;
        const merged = { ...act, ...updates };
        // Recalculate duration if time changed
        if (updates.startTime !== undefined || updates.endTime !== undefined) {
          merged.durationMinutes = calculateDurationMinutes(merged.startTime, merged.endTime);
        }
        return merged;
      })
    );
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const addCategory = (categoryData: Omit<ActivityCategory, 'id'>) => {
    const newCategory: ActivityCategory = {
      id: `cat-${Date.now()}`,
      ...categoryData,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<ActivityCategory>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const resetToDemoData = () => {
    setActivities(INITIAL_DEMO_ACTIVITIES);
    setCategories(DEFAULT_CATEGORIES);
    setPreferences(DEFAULT_PREFERENCES);
    setSelectedDate(TODAY_DATE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  };

  const clearAllActivities = () => {
    setActivities([]);
  };

  const importData = (imported: {
    activities?: Activity[];
    categories?: ActivityCategory[];
    preferences?: UserPreferences;
  }) => {
    try {
      if (imported.activities && Array.isArray(imported.activities)) {
        setActivities(imported.activities);
      }
      if (imported.categories && Array.isArray(imported.categories)) {
        setCategories(imported.categories);
      }
      if (imported.preferences) {
        setPreferences(imported.preferences);
      }
      return true;
    } catch {
      return false;
    }
  };

  // Computations
  const daySummary = useMemo(() => {
    return calculateDaySummary(selectedDate, activities, categories);
  }, [selectedDate, activities, categories]);

  const weeklyStats = useMemo(() => {
    return getPast7DaysStats(selectedDate, activities, categories);
  }, [selectedDate, activities, categories]);

  return (
    <AppContext.Provider
      value={{
        activities,
        categories,
        preferences,
        selectedDate,
        activeTab,
        showWeeklyInsights,
        isAddModalOpen,
        activityToEdit,

        setActiveTab,
        setSelectedDate,
        setShowWeeklyInsights,
        openAddModal,
        closeAddModal,

        addActivity,
        updateActivity,
        deleteActivity,

        updatePreferences,
        addCategory,
        updateCategory,

        resetToDemoData,
        clearAllActivities,
        importData,

        daySummary,
        weeklyStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
