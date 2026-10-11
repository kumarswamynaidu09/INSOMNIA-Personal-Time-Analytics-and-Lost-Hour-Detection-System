import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Settings,
  Bell,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Save,
  Check,
  Tag,
  Clock,
  Sparkles,
  Shield,
  Trash,
} from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';
import { ActivityClassification } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    categories,
    addCategory,
    updateCategory,
    resetToDemoData,
    clearAllActivities,
    importData,
    activities,
    setShowSplash,
  } = useApp();

  const [name, setName] = useState(preferences.name);
  const [productiveTarget, setProductiveTarget] = useState(preferences.productiveTargetHours.toString());
  const [sleepTarget, setSleepTarget] = useState(preferences.sleepTargetHours.toString());
  const [dailyReviewReminder, setDailyReviewReminder] = useState(preferences.dailyReviewReminder);
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime);
  const [showOverlapsWarning, setShowOverlapsWarning] = useState(preferences.showOverlapsWarning);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // New Category Modal State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatClassification, setNewCatClassification] = useState<ActivityClassification>('recoverable');
  const [newCatColor, setNewCatColor] = useState('#FACC15');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      name: name.trim() || 'Alex Chen',
      productiveTargetHours: parseFloat(productiveTarget) || 7.0,
      sleepTargetHours: parseFloat(sleepTarget) || 7.5,
      dailyReviewReminder,
      reminderTime,
      showOverlapsWarning,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      preferences,
      categories,
      activities,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insomnia-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = importData(parsed);
        if (success) {
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup structure.');
        }
      } catch {
        alert('Could not read or parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      classification: newCatClassification,
      color: newCatColor,
      icon: newCatIcon,
      description: 'Custom user defined category',
    });

    setNewCatName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0F172A]"></span>
          <span className="text-xs font-black uppercase tracking-widest text-[#0F172A]">
            INSOMNIA / Settings
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
          Profile & Preferences
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Configure productivity targets, activity categories, and audit rules.
        </p>
      </div>

      {isSavedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated and saved to local storage!</span>
        </div>
      )}

      {/* User Profile & Goals Form */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
              <User className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A]">Auditing Targets</h2>
              <p className="text-[11px] text-[#64748B]">Your baseline daily benchmarks</p>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0F172A] text-[#FACC15] text-xs font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">
                Daily Focus Goal (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={productiveTarget}
                onChange={e => setProductiveTarget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1">
                Sleep Baseline (hrs)
              </label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="12"
                value={sleepTarget}
                onChange={e => setSleepTarget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-[#0F172A] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {/* Audit & Notification Toggles */}
        <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Daily Reminders & Auditing Alerts
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#0F172A]" />
              <div>
                <span className="text-xs font-bold text-[#0F172A] block">Evening Review Reminder</span>
                <span className="text-[11px] text-[#64748B] block">Notification to close your daily 24h audit</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="px-2 py-1 text-xs font-mono border border-[#CBD5E1] rounded-lg bg-white"
              />
              <input
                type="checkbox"
                checked={dailyReviewReminder}
                onChange={e => setDailyReviewReminder(e.target.checked)}
                className="w-4 h-4 text-[#0F172A] rounded border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Highlight Overlapping Entries</span>
              <span className="text-[11px] text-[#64748B] block">Show visual indicators on colliding time intervals</span>
            </div>
            <input
              type="checkbox"
              checked={showOverlapsWarning}
              onChange={e => setShowOverlapsWarning(e.target.checked)}
              className="w-4 h-4 text-[#0F172A] rounded border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">Introductory Splash Screen</span>
              <span className="text-[11px] text-[#64748B] block">Replay the 24-hour circular animation intro</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSplash(true)}
              className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-[#FACC15] text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Replay Splash
            </button>
          </div>
        </div>
      </form>

      {/* Category Management */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
              <Tag className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A]">Activity Categories</h2>
              <p className="text-[11px] text-[#64748B]">Classification determines what counts as Lost vs Rest</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Add Category Form Modal / Drawer */}
        {isAddingCategory && (
          <form onSubmit={handleCreateCategory} className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0F172A]">Create Custom Category</h3>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
              >
                Cancel
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Category name (e.g. Social Gaming, Reading)"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white font-medium"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#64748B] block mb-1">Classification</label>
                <select
                  value={newCatClassification}
                  onChange={e => setNewCatClassification(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white font-medium"
                >
                  <option value="productive">Productive (Focus)</option>
                  <option value="recoverable">Recoverable (Lost Hours)</option>
                  <option value="restorative">Restorative (Rest/Sleep)</option>
                  <option value="routine">Routine (Meals/Transit)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#64748B] block mb-1">Color</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {['#0F172A', '#FACC15', '#64748B', '#0D9488', '#EF4444', '#8B5CF6'].map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewCatColor(c)}
                      className={`w-5 h-5 rounded-full border ${newCatColor === c ? 'ring-2 ring-black ring-offset-1' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F172A] text-[#FACC15] text-xs font-bold rounded-xl"
              >
                Create Category
              </button>
            </div>
          </form>
        )}

        {/* Existing Categories List */}
        <div className="divide-y divide-[#F1F5F9] -mx-2 max-h-72 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id} className="p-2.5 flex items-center justify-between hover:bg-[#F8FAFC] rounded-xl transition">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <span className="text-xs font-bold text-[#0F172A] block">{cat.name}</span>
                  <span className="text-[10px] text-[#64748B] block truncate max-w-[200px]">
                    {cat.description}
                  </span>
                </div>
              </div>

              {/* Classification Selector */}
              <select
                value={cat.classification}
                onChange={e => updateCategory(cat.id, { classification: e.target.value as any })}
                className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition ${
                  cat.classification === 'recoverable'
                    ? 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]'
                    : cat.classification === 'productive'
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
                }`}
              >
                <option value="productive">Productive</option>
                <option value="recoverable">Lost Hours</option>
                <option value="restorative">Restorative</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
            <Database className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A]">Data Management</h2>
            <p className="text-[11px] text-[#64748B]">
              {activities.length} total activity records in local storage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0F172A]" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] text-xs font-bold transition cursor-pointer">
            <Upload className="w-4 h-4 text-[#0F172A]" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Reset to initial sample 7-day dataset? Any unexported entries will be replaced.')) {
                resetToDemoData();
              }
            }}
            className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all logged activities? This action cannot be undone.')) {
                clearAllActivities();
              }
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Clear Activities</span>
          </button>
        </div>
      </div>
    </div>
  );
};
