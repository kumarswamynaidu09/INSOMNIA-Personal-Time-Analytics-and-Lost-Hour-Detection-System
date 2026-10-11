import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatMinutes, formatDecimalHours } from '../../utils/timeCalculations';
import { X, TrendingUp, AlertCircle, ArrowUpRight, Zap, Moon, Calendar } from 'lucide-react';

export const WeeklyInsightsModal: React.FC = () => {
  const { showWeeklyInsights, setShowWeeklyInsights, weeklyStats, setSelectedDate, setActiveTab } = useApp();

  if (!showWeeklyInsights) return null;

  const maxTotalMinutes = 1440; // 24 hours per day

  const formatHours = (mins: number) => {
    return `${(mins / 60).toFixed(1)}h`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs">
      <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#CBD5E1] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
              <TrendingUp className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#FACC15]">
                Analytics Audit
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Weekly Insights</h2>
            </div>
          </div>
          <button
            onClick={() => setShowWeeklyInsights(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                7-Day Lost Hours
              </span>
              <span className="text-2xl font-black text-[#854D0E] block mt-1">
                {formatDecimalHours(weeklyStats.totalRecoverableMin)}
              </span>
              <span className="text-[11px] text-[#A16207] font-medium block mt-0.5">
                Avg {formatDecimalHours(weeklyStats.avgRecoverableMin)}/day
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Total Focus Time
              </span>
              <span className="text-2xl font-black text-[#0F172A] block mt-1">
                {formatDecimalHours(weeklyStats.totalProductiveMin)}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium block mt-0.5">
                Avg {formatDecimalHours(weeklyStats.avgProductiveMin)}/day
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Peak Drift Day
              </span>
              <span className="text-xl font-black text-[#0F172A] block mt-1 truncate">
                {weeklyStats.peakLostDay.shortDay}
              </span>
              <span className="text-[11px] font-bold text-[#EAB308] block mt-0.5">
                {formatMinutes(weeklyStats.peakLostDay.summary.recoverableMinutes)} lost
              </span>
            </div>
          </div>

          {/* 7-Day Stacked Allocation Chart */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">7-Day Allocation Breakdown</h3>
                <p className="text-xs text-[#64748B]">24-hour distribution across productive, lost, and rest</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-[#475569]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0F172A]"></span> Productive
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FACC15]"></span> Lost
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]"></span> Rest
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E2E8F0]"></span> Untracked
                </span>
              </div>
            </div>

            {/* Stacked Vertical Bars */}
            <div className="grid grid-cols-7 gap-2.5 pt-2 pb-1 items-end h-56 border-b border-[#F1F5F9]">
              {weeklyStats.days.map(d => {
                const s = d.summary;
                const prodPct = (s.productiveMinutes / maxTotalMinutes) * 100;
                const lostPct = (s.recoverableMinutes / maxTotalMinutes) * 100;
                const restPct = ((s.restorativeMinutes + s.routineMinutes) / maxTotalMinutes) * 100;
                const untrackedPct = Math.max(0, 100 - (prodPct + lostPct + restPct));

                return (
                  <button
                    key={d.date}
                    onClick={() => {
                      setSelectedDate(d.date);
                      setShowWeeklyInsights(false);
                      setActiveTab('timeline');
                    }}
                    className="flex flex-col items-center h-full group focus:outline-none cursor-pointer"
                    title={`Click to view ${d.label} in Timeline`}
                  >
                    {/* The Bar */}
                    <div className="w-full flex-1 bg-[#F1F5F9] rounded-xl overflow-hidden flex flex-col-reverse relative p-0.5 group-hover:ring-2 group-hover:ring-[#0F172A] transition">
                      {/* Productive (Dark Blue) */}
                      <div
                        style={{ height: `${prodPct}%` }}
                        className="w-full bg-[#0F172A] rounded-b-md transition-all"
                        title={`Productive: ${formatHours(s.productiveMinutes)}`}
                      />
                      {/* Lost Hours (Yellow Accent) */}
                      <div
                        style={{ height: `${lostPct}%` }}
                        className="w-full bg-[#FACC15] transition-all"
                        title={`Lost: ${formatHours(s.recoverableMinutes)}`}
                      />
                      {/* Rest & Routine (Slate) */}
                      <div
                        style={{ height: `${restPct}%` }}
                        className="w-full bg-[#64748B] transition-all"
                        title={`Rest & Routine: ${formatHours(s.restorativeMinutes + s.routineMinutes)}`}
                      />
                      {/* Untracked (Light Gray) */}
                      <div
                        style={{ height: `${untrackedPct}%` }}
                        className="w-full bg-[#E2E8F0] transition-all"
                        title={`Untracked: ${formatHours(s.untrackedMinutes)}`}
                      />
                    </div>

                    {/* Date label */}
                    <span className="text-[11px] font-bold text-[#0F172A] mt-2 group-hover:text-[#2563EB]">
                      {d.shortDay}
                    </span>
                    <span className="text-[9px] font-mono text-[#64748B]">
                      {d.label.split(' ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-center text-[#64748B] mt-2">
              Tip: Tap any day column to open that day's detailed timeline.
            </p>
          </div>

          {/* Key Observations & Patterns */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#EAB308]" />
              Actionable Weekly Observations
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#FEFCE8] border border-[#FEF08A] rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#CA8A04] shrink-0 mt-0.5" />
                <div className="text-xs text-[#713F12]">
                  <strong className="block text-[#854D0E] font-bold">Nighttime Screen Drift Window</strong>
                  Over 55% of your recoverable time this week occurred between 22:00 and 01:30. Setting a device curfew at 22:30 could reclaim up to 6.5 hours next week.
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start gap-3">
                <Moon className="w-4 h-4 text-[#334155] shrink-0 mt-0.5" />
                <div className="text-xs text-[#334155]">
                  <strong className="block text-[#0F172A] font-bold">Restorative Balance Maintained</strong>
                  You logged an average of 6.8 hours of intentional rest and sleep. Intentional restorative leisure was protected from accidental loss.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={() => setShowWeeklyInsights(false)}
            className="px-5 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
};
