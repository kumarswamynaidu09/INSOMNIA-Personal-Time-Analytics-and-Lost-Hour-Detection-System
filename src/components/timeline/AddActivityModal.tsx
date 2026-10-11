import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateDurationMinutes, formatMinutes, timeStringToMinutes } from '../../utils/timeCalculations';
import { X, Clock, AlertTriangle, Check, Calendar } from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';

export const AddActivityModal: React.FC = () => {
  const {
    isAddModalOpen,
    closeAddModal,
    activityToEdit,
    addActivity,
    updateActivity,
    categories,
    selectedDate,
    activities,
  } = useApp();

  const [date, setDate] = useState<string>(selectedDate);
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'deep-work');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:30');
  const [notes, setNotes] = useState<string>('');
  const [isRecoverableFlag, setIsRecoverableFlag] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (activityToEdit) {
      setDate(activityToEdit.date);
      setTitle(activityToEdit.title);
      setCategoryId(activityToEdit.categoryId);
      setStartTime(activityToEdit.startTime);
      setEndTime(activityToEdit.endTime);
      setNotes(activityToEdit.notes || '');
      setIsRecoverableFlag(!!activityToEdit.isRecoverableFlag);
    } else {
      setDate(selectedDate);
      setTitle('');
      setCategoryId(categories[0]?.id || 'deep-work');
      setStartTime('09:00');
      setEndTime('10:30');
      setNotes('');
      setIsRecoverableFlag(false);
    }
    setError('');
  }, [activityToEdit, isAddModalOpen, selectedDate, categories]);

  if (!isAddModalOpen) return null;

  const durationMin = calculateDurationMinutes(startTime, endTime);
  const spansMidnight = timeStringToMinutes(endTime) < timeStringToMinutes(startTime) && endTime !== '00:00';

  // Check overlap with existing activities on this date (excluding currently edited item)
  const existingOnDate = activities.filter(
    a => a.date === date && (!activityToEdit || a.id !== activityToEdit.id)
  );

  const newStartMin = timeStringToMinutes(startTime);
  const newEndMin = spansMidnight ? 1440 : timeStringToMinutes(endTime);

  const overlappingActivities = existingOnDate.filter(act => {
    const actStart = timeStringToMinutes(act.startTime);
    const actEnd = timeStringToMinutes(act.endTime) < actStart ? 1440 : timeStringToMinutes(act.endTime);
    return Math.max(newStartMin, actStart) < Math.min(newEndMin, actEnd);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide an activity title');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start time and end time are required');
      return;
    }

    if (startTime === endTime) {
      setError('Start time and end time cannot be identical');
      return;
    }

    if (activityToEdit) {
      updateActivity(activityToEdit.id, {
        date,
        title: title.trim(),
        categoryId,
        startTime,
        endTime,
        notes: notes.trim() || undefined,
        isRecoverableFlag,
      });
    } else {
      addActivity({
        date,
        title: title.trim(),
        categoryId,
        startTime,
        endTime,
        notes: notes.trim() || undefined,
        isRecoverableFlag,
      });
    }

    closeAddModal();
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#CBD5E1] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0F172A] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#FACC15]">
              {activityToEdit ? 'Modify Entry' : 'Log Time'}
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">
              {activityToEdit ? 'Edit Activity' : 'Add Activity'}
            </h2>
          </div>
          <button
            onClick={closeAddModal}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Activity Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Deep Work Coding, Doomscrolling Twitter, Lunch"
              className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition bg-[#F8FAFC]"
              autoFocus
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#0F172A] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
              />
              <Calendar className="w-4 h-4 text-[#64748B] absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Category & Classification
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
              {categories.map(cat => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      if (cat.classification === 'recoverable') {
                        setIsRecoverableFlag(true);
                      }
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-xs transition border ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white hover:bg-[#F1F5F9] text-[#1E293B] border-[#E2E8F0]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#FACC15' : cat.color }}
                    />
                    <div className="truncate flex-1">
                      <p className="font-semibold truncate">{cat.name}</p>
                      <span className={`text-[10px] block truncate ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {cat.classification}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time pickers: Start Time & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                Start Time (24h)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[#0F172A] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                End Time (24h)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-[#0F172A] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Computed Duration & Midnight banner */}
          <div className="p-3 bg-[#F1F5F9] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#334155]">
              <Clock className="w-4 h-4 text-[#0F172A]" />
              <span className="font-medium">Calculated Duration:</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-sm text-[#0F172A]">
                {formatMinutes(durationMin)}
              </span>
              {spansMidnight && (
                <span className="block text-[10px] font-bold text-[#EAB308]">
                  Spans across midnight into tomorrow
                </span>
              )}
            </div>
          </div>

          {/* Overlap alert if any */}
          {overlappingActivities.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Time Overlap Detected ({overlappingActivities.length})</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                This overlaps with: {overlappingActivities.map(o => `"${o.title}" (${o.startTime}-${o.endTime})`).join(', ')}.
                You can still save, and the app will flag the conflict.
              </p>
            </div>
          )}

          {/* Recoverable Flag Toggle */}
          <div className="p-3.5 rounded-xl border border-[#FEF08A] bg-[#FEFCE8] flex items-start gap-3">
            <input
              type="checkbox"
              id="recoverableCheckbox"
              checked={isRecoverableFlag || selectedCategory?.classification === 'recoverable'}
              onChange={e => setIsRecoverableFlag(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-400"
            />
            <label htmlFor="recoverableCheckbox" className="text-xs text-[#713F12] cursor-pointer">
              <span className="font-bold block text-sm">Flag as Potentially Recoverable ("Lost Hours")</span>
              <span className="text-[11px] block text-[#854D0E] mt-0.5">
                Mark this block if it was spent unproductively (e.g. doomscrolling, insomnia wakefulness, delay) rather than intentional rest.
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Reflections / Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What triggered this activity? How did you feel?"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-[#0F172A] text-[#FACC15] hover:bg-slate-800 shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{activityToEdit ? 'Save Changes' : 'Log Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
