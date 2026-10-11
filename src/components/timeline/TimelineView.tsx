import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatMinutes,
  formatTime12h,
  timeStringToMinutes,
  detectOverlaps,
} from '../../utils/timeCalculations';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';
import { Activity } from '../../types';

export const TimelineView: React.FC = () => {
  const {
    activities,
    categories,
    selectedDate,
    setSelectedDate,
    openAddModal,
    deleteActivity,
    daySummary,
  } = useApp();

  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter activities for selected date and sort chronologically
  const dayActivities = activities
    .filter(a => a.date === selectedDate)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Date controls
  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate('2026-10-11');
  };

  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const isToday = selectedDate === '2026-10-11';
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Overlap map for quick indicator on individual items
  const overlaps = daySummary.overlaps;
  const overlappingActivityIds = new Set<string>();
  overlaps.forEach(o => {
    overlappingActivityIds.add(o.activityA.id);
    overlappingActivityIds.add(o.activityB.id);
  });

  // Filtered activities
  const filteredActivities = dayActivities.filter(act => {
    if (filterClassification === 'all') return true;
    const cat = categoryMap.get(act.categoryId);
    if (filterClassification === 'recoverable') {
      return act.isRecoverableFlag || cat?.classification === 'recoverable';
    }
    return cat?.classification === filterClassification;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl text-[#0F172A] hover:bg-[#F1F5F9] transition"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-sm font-black text-[#0F172A] tracking-tight">
                {formattedDate}
              </h2>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0F172A] text-[#FACC15]">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-[11px] font-mono font-medium text-[#64748B] bg-transparent border-0 underline hover:text-[#0F172A] cursor-pointer"
              />
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-[11px] font-bold text-[#0F172A] hover:underline"
                >
                  • Jump to Today
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl text-[#0F172A] hover:bg-[#F1F5F9] transition"
            aria-label="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Metric Mini-Ticker */}
        <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-[#F1F5F9] text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Productive</span>
            <span className="text-xs font-black text-[#0F172A] font-mono">
              {formatMinutes(daySummary.productiveMinutes)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#854D0E] block">Lost Hours</span>
            <span className="text-xs font-black text-[#854D0E] font-mono">
              {formatMinutes(daySummary.recoverableMinutes)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Rest/Sleep</span>
            <span className="text-xs font-black text-[#475569] font-mono">
              {formatMinutes(daySummary.restorativeMinutes)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Untracked</span>
            <span className="text-xs font-black text-[#64748B] font-mono">
              {formatMinutes(daySummary.untrackedMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Overlapping Activities Warning Alert */}
      {overlaps.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Overlapping Schedule Detected ({overlaps.length} conflicts)</span>
          </div>
          <div className="space-y-1">
            {overlaps.map((o, idx) => (
              <p key={idx} className="text-[11px] text-amber-800">
                • <strong>"{o.activityA.title}"</strong> ({o.activityA.startTime}-{o.activityA.endTime}) overlaps with{' '}
                <strong>"{o.activityB.title}"</strong> ({o.activityB.startTime}-{o.activityB.endTime}) by {o.overlapMinutes} min.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar & Filter Chips */}
      <div className="flex items-center justify-between gap-2">
        {/* Classification Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'productive', label: 'Productive' },
            { id: 'recoverable', label: 'Lost' },
            { id: 'restorative', label: 'Rest' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterClassification(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterClassification === f.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Add Activity Button */}
        <button
          onClick={() => openAddModal()}
          className="px-3.5 py-1.5 rounded-xl bg-[#0F172A] text-[#FACC15] text-xs font-black hover:bg-slate-800 shadow-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Chronological Activity List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E2E8F0] space-y-3">
            <Clock className="w-10 h-10 mx-auto text-[#CBD5E1]" />
            <h3 className="text-sm font-bold text-[#0F172A]">No Activities Recorded</h3>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              There are no logged activities matching this view for {formattedDate}.
            </p>
            <button
              onClick={() => openAddModal()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-[#FACC15] text-xs font-bold hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Activity Now</span>
            </button>
          </div>
        ) : (
          filteredActivities.map(act => {
            const cat = categoryMap.get(act.categoryId);
            const isLost = act.isRecoverableFlag || cat?.classification === 'recoverable';
            const isOverlapping = overlappingActivityIds.has(act.id);
            const spansMidnight = act.startTime > act.endTime;

            return (
              <div
                key={act.id}
                className={`bg-white rounded-2xl p-4 border transition relative ${
                  isOverlapping
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : isLost
                    ? 'border-[#FEF08A] bg-[#FEFCE8]/40'
                    : 'border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isLost
                          ? 'bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]'
                          : cat?.classification === 'productive'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F1F5F9] text-[#334155]'
                      }`}
                    >
                      <CategoryIcon name={cat?.icon || 'Clock'} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">
                          {act.title}
                        </h3>
                        {isLost && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]">
                            Lost Hours
                          </span>
                        )}
                        {isOverlapping && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Overlap
                          </span>
                        )}
                      </div>

                      {/* Time and Duration Details */}
                      <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 font-mono">
                        <span className="font-semibold text-[#0F172A]">
                          {act.startTime} — {act.endTime}
                        </span>
                        <span>•</span>
                        <span className="font-extrabold text-[#0F172A]">
                          {formatMinutes(act.durationMinutes)}
                        </span>
                        {spansMidnight && (
                          <span className="text-[10px] font-sans font-bold text-[#EAB308]">
                            (crosses midnight)
                          </span>
                        )}
                      </div>

                      {/* Category Label */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat?.color || '#64748B' }}
                        />
                        <span className="text-xs font-semibold text-[#475569]">
                          {cat?.name || 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          ({cat?.classification || 'routine'})
                        </span>
                      </div>

                      {/* Notes if present */}
                      {act.notes && (
                        <p className="text-xs text-[#475569] mt-2 italic bg-[#F8FAFC] p-2 rounded-lg border border-[#F1F5F9]">
                          "{act.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Edit / Delete Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openAddModal(act)}
                      className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition cursor-pointer"
                      title="Edit Activity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${act.title}"?`)) {
                          deleteActivity(act.id);
                        }
                      }}
                      className="p-2 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
