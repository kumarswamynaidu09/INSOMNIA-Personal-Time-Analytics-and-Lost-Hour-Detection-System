import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock24Visualization } from './Clock24Visualization';
import { formatMinutes, formatTime12h } from '../../utils/timeCalculations';
import {
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';

export const HomeView: React.FC = () => {
  const {
    selectedDate,
    daySummary,
    activities,
    categories,
    preferences,
    openAddModal,
    setShowWeeklyInsights,
    setActiveTab,
  } = useApp();

  const dayActivities = activities
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Parse friendly display date
  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const productiveHoursDecimal = (daySummary.productiveMinutes / 60).toFixed(1);
  const targetProgress = Math.min(
    100,
    Math.round((daySummary.productiveMinutes / (preferences.productiveTargetHours * 60)) * 100)
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Top App Header & Date Bar */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15] ring-2 ring-[#FEF08A]"></span>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F172A]">
              INSOMNIA
            </span>
            <span className="text-xs font-mono text-[#64748B]">/ Lost Hours</span>
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
            Today's Audit
          </h1>
          <p className="text-xs text-[#64748B] flex items-center gap-1 font-medium mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
            {formattedDate}
          </p>
        </div>

        {/* Weekly Insights Trigger Button */}
        <button
          onClick={() => setShowWeeklyInsights(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] shadow-xs text-xs font-bold transition group cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-[#EAB308] group-hover:scale-110 transition-transform" />
          <span>Weekly Insights</span>
        </button>
      </div>

      {/* Overlap alert banner if any exists */}
      {daySummary.overlapCount > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{daySummary.overlapCount} Time Overlap(s)</strong> detected in today's log.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('timeline')}
            className="text-xs font-bold text-amber-950 underline hover:no-underline"
          >
            Review in Timeline
          </button>
        </div>
      )}

      {/* 24-Hour Circular Allocation Visualization */}
      <Clock24Visualization />

      {/* Metric 3-Card Summary Grid (Productive, Recoverable, Untracked) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Productive Focus */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Productive Time
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#0F172A]">
                {formatMinutes(daySummary.productiveMinutes)}
              </span>
              <span className="text-xs text-[#64748B] font-mono">
                / {preferences.productiveTargetHours}h target
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#F1F5F9] h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#0F172A] h-full rounded-full transition-all duration-300"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1.5 font-medium">
              <span>Goal: {preferences.productiveTargetHours}h</span>
              <span className="font-bold text-[#0F172A]">{targetProgress}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Potentially Recoverable (Lost Hours) */}
        <div className="bg-[#FEFCE8] p-4 rounded-2xl border border-[#FEF08A] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#854D0E]">
              Recoverable Time
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#FACC15] text-[#854D0E] flex items-center justify-center font-bold text-xs shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 text-[#854D0E]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#854D0E]">
                {formatMinutes(daySummary.recoverableMinutes)}
              </span>
              <span className="text-xs text-[#A16207] font-semibold">
                Lost Drift
              </span>
            </div>
            <p className="text-[11px] text-[#713F12] mt-2 leading-relaxed">
              Screen loops & context delay available to reclaim for deep focus or sleep.
            </p>
            <button
              onClick={() => setActiveTab('lost-hours')}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#854D0E] hover:text-[#713F12]"
            >
              Inspect Lost Hours <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Untracked Time */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Untracked Time
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#64748B] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#475569]">
                {formatMinutes(daySummary.untrackedMinutes)}
              </span>
              <span className="text-xs text-[#94A3B8]">
                of 24h
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-2 leading-relaxed">
              Unaccounted hours between logged intervals. (Not assumed to be lost).
            </p>
            <button
              onClick={() => openAddModal()}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0F172A] hover:underline"
            >
              + Log Gap <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Action Banner */}
      <div className="bg-[#0F172A] text-white p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#FACC15] block">
            Immediate Time Audit
          </span>
          <h3 className="text-base font-extrabold text-white mt-0.5">
            Log What Just Happened
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Capture unintentional screen drift or deep work to maintain an exact audit.
          </p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="px-4 py-2.5 rounded-2xl bg-[#FACC15] text-[#0F172A] font-black text-xs hover:bg-yellow-400 shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Today's Logged Activities Snapshot */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Today's Recorded Blocks</h3>
            <p className="text-xs text-[#64748B]">
              {dayActivities.length} {dayActivities.length === 1 ? 'entry' : 'entries'} logged today
            </p>
          </div>
          <button
            onClick={() => setActiveTab('timeline')}
            className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] flex items-center gap-1"
          >
            <span>Full Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dayActivities.length === 0 ? (
          <div className="text-center py-8 text-[#64748B] space-y-2">
            <Clock className="w-8 h-8 mx-auto text-[#CBD5E1]" />
            <p className="text-xs font-medium">No activities recorded for today yet.</p>
            <button
              onClick={() => openAddModal()}
              className="text-xs font-bold text-[#0F172A] underline hover:no-underline"
            >
              Log your first activity
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9] -mx-2">
            {dayActivities.slice(0, 5).map(act => {
              const cat = categoryMap.get(act.categoryId);
              const isLost = act.isRecoverableFlag || cat?.classification === 'recoverable';

              return (
                <div
                  key={act.id}
                  className="px-3 py-3 flex items-center justify-between hover:bg-[#F8FAFC] rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isLost
                          ? 'bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]'
                          : 'bg-[#0F172A] text-white'
                      }`}
                    >
                      <CategoryIcon name={cat?.icon || 'Clock'} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] truncate max-w-[180px] sm:max-w-xs">
                        {act.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5 font-mono">
                        <span>
                          {act.startTime} - {act.endTime}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-[#334155]">
                          {formatMinutes(act.durationMinutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isLost
                          ? 'bg-[#FEF08A] text-[#854D0E]'
                          : cat?.classification === 'productive'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F1F5F9] text-[#475569]'
                      }`}
                    >
                      {isLost ? 'Lost Hours' : cat?.name || 'Routine'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Insights Teaser Card */}
      <div
        onClick={() => setShowWeeklyInsights(true)}
        className="bg-white p-5 rounded-3xl border border-[#CBD5E1] shadow-xs hover:border-[#0F172A] transition cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#FEF9C3] group-hover:border-[#FACC15] transition">
            <TrendingUp className="w-5 h-5 text-[#0F172A] group-hover:text-[#854D0E]" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#0F172A]">
              7-Day Allocation & Nocturnal Patterns
            </h4>
            <p className="text-[11px] text-[#64748B]">
              Discover which days have the highest screen drift and recover up to 10h/week.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0F172A] group-hover:translate-x-1 transition" />
      </div>
    </div>
  );
};
