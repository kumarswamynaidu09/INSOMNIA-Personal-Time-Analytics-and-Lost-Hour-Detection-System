import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatMinutes,
  formatDecimalHours,
  calculateCategoryBreakdowns,
} from '../../utils/timeCalculations';
import {
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';

export const LostHoursView: React.FC = () => {
  const { activities, categories, selectedDate, daySummary, weeklyStats, setActiveTab } = useApp();
  const [scope, setScope] = useState<'today' | 'week'>('week');
  const [reclaimGoalHours, setReclaimGoalHours] = useState<number>(1.5);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Activities to analyze based on scope
  const targetActivities =
    scope === 'today'
      ? activities.filter(a => a.date === selectedDate)
      : activities.filter(a => {
          const sevenDays = new Set(weeklyStats.days.map(d => d.date));
          return sevenDays.has(a.date);
        });

  // Filter only recoverable activities
  const recoverableActivities = targetActivities.filter(a => {
    const cat = categoryMap.get(a.categoryId);
    return a.isRecoverableFlag || cat?.classification === 'recoverable';
  });

  const totalRecoverableMinutes = recoverableActivities.reduce(
    (sum, a) => sum + a.durationMinutes,
    0
  );

  const breakdowns = calculateCategoryBreakdowns(recoverableActivities, categories);

  const scopeLabel = scope === 'today' ? "Today's Lost Hours" : '7-Day Lost Hours';

  // Distinction calculations
  const totalScopeUntrackedMinutes =
    scope === 'today'
      ? daySummary.untrackedMinutes
      : weeklyStats.totalUntrackedMin;

  const totalScopeRestorativeMinutes =
    scope === 'today'
      ? daySummary.restorativeMinutes
      : weeklyStats.totalRestorativeMin;

  return (
    <div className="space-y-6 pb-24">
      {/* View Header & Scope Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F172A]">
              INSOMNIA / Audit
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mt-0.5">
            Lost Hours Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Identifying recoverable drift without penalizing intentional rest.
          </p>
        </div>

        {/* Scope Toggle */}
        <div className="bg-[#E2E8F0] p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setScope('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              scope === 'today'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setScope('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              scope === 'week'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            7 Days
          </button>
        </div>
      </div>

      {/* Philosophy Banner: Differentiating Lost vs Restorative */}
      <div className="bg-[#0F172A] text-white p-5 rounded-3xl shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-[#FACC15] flex items-center justify-center shrink-0 border border-slate-700">
            <ShieldCheck className="w-5 h-5 text-[#FACC15]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Core Principle: Rest Is Not "Wasted Time"
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              INSOMNIA separates intentional restorative leisure, sleep, and meals from genuine loss.
              Lost hours represent <strong>unintentional drift, feed doomscrolling, insomnia tossing,</strong> and{' '}
              <strong>unfocused overrun</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Main KPI Card: Total Lost Hours */}
      <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#854D0E]">
            {scopeLabel}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#FACC15] text-[#854D0E] font-black text-xs border border-[#EAB308]">
            Potentially Recoverable
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-black text-[#854D0E] tracking-tight">
            {formatDecimalHours(totalRecoverableMinutes)}
          </span>
          <span className="text-sm font-bold text-[#A16207]">
            ({formatMinutes(totalRecoverableMinutes)})
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-[#FEF08A] grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#854D0E] font-bold block">Protected Rest & Sleep</span>
            <span className="text-[#0F172A] font-black text-sm mt-0.5 block">
              {formatDecimalHours(totalScopeRestorativeMinutes)}
            </span>
            <span className="text-[10px] text-[#64748B]">Kept safe as healthy baseline</span>
          </div>
          <div>
            <span className="text-[#64748B] font-bold block">Untracked Gap</span>
            <span className="text-[#475569] font-black text-sm mt-0.5 block">
              {formatDecimalHours(totalScopeUntrackedMinutes)}
            </span>
            <span className="text-[10px] text-[#64748B]">Unaccounted (not assumed lost)</span>
          </div>
        </div>
      </div>

      {/* Category-Level Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">Category Breakdown of Loss</h3>
            <p className="text-xs text-[#64748B]">Where your recoverable time slipped away</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#64748B]">
            {recoverableActivities.length} occurrences
          </span>
        </div>

        {breakdowns.length === 0 ? (
          <div className="text-center py-8 text-[#64748B]">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#0F172A]">Zero Lost Hours Logged</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              All tracked time in this period was intentional work or restorative downtime.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {breakdowns.map(item => {
              const pct = totalRecoverableMinutes > 0
                ? Math.round((item.totalMinutes / totalRecoverableMinutes) * 100)
                : 0;

              return (
                <div key={item.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FEF9C3] flex items-center justify-center text-[#854D0E]">
                        <CategoryIcon name={item.category.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold text-[#0F172A]">
                        {item.category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-extrabold text-[#854D0E]">
                        {formatMinutes(item.totalMinutes)}
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#EAB308] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recoverable vs. Untracked Explicit Comparison */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#0F172A]" />
          Recoverable vs. Untracked Time
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Many productivity apps wrongly label any blank calendar hour as "wasted". In INSOMNIA:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#FEFCE8] border border-[#FEF08A]">
            <span className="text-xs font-bold text-[#854D0E] block">
              Potentially Recoverable Time
            </span>
            <p className="text-[11px] text-[#713F12] mt-1 leading-relaxed">
              Positively identified as unfulfilling passive drift (e.g., scrolling past midnight, aimless browsing, distracted delays). You have high agency to reclaim these hours.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#334155] block">
              Untracked Gaps
            </span>
            <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
              Unrecorded moments between scheduled blocks (e.g., getting water, casual chats, brief intervals). Untracked time is neutral until you choose to log it.
            </p>
          </div>
        </div>
      </div>

      {/* Reclaim Simulator / Target Calculator */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#FACC15] block">
            Opportunity Calculator
          </span>
          <h3 className="text-base font-extrabold text-white mt-0.5">
            What Can You Build With Reclaimed Hours?
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Slide to see the compound dividend of curbing late night and screen drift.
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-300">Daily Target to Reclaim:</span>
            <span className="text-[#FACC15] text-base">{reclaimGoalHours.toFixed(1)} hrs/day</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.5"
            value={reclaimGoalHours}
            onChange={e => setReclaimGoalHours(parseFloat(e.target.value))}
            className="w-full accent-[#FACC15] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.5h/day</span>
            <span>2.0h/day</span>
            <span>4.0h/day</span>
          </div>
        </div>

        {/* Calculated Projection Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly</span>
            <span className="text-lg font-black text-[#FACC15] block mt-1">
              {(reclaimGoalHours * 7).toFixed(1)}h
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">Focus boost</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly</span>
            <span className="text-lg font-black text-[#FACC15] block mt-1">
              {(reclaimGoalHours * 30).toFixed(0)}h
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">~1 full work week</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual</span>
            <span className="text-lg font-black text-[#FACC15] block mt-1">
              {(reclaimGoalHours * 365).toFixed(0)}h
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">Ship 2 major goals</span>
          </div>
        </div>
      </div>
    </div>
  );
};
