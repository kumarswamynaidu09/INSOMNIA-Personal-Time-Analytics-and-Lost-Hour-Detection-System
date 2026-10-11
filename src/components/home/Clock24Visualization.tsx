import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { get24HourAllocation, formatMinutes, formatTime12h, HourSegment } from '../../utils/timeCalculations';

export const Clock24Visualization: React.FC = () => {
  const { activities, categories, selectedDate, daySummary } = useApp();
  const [hoveredHour, setHoveredHour] = useState<HourSegment | null>(null);

  const dayActivities = activities.filter(a => a.date === selectedDate);
  const hourSegments = get24HourAllocation(dayActivities, categories);

  const radius = 108;
  const innerRadius = 82;
  const cx = 140;
  const cy = 140;

  // Render 24 distinct segment wedges/arcs
  // 0h is at top (-90 degrees), each hour spans 360/24 = 15 degrees
  const getArcPath = (hourIndex: number, rOut: number, rIn: number) => {
    const angleStep = 360 / 24;
    const startAngle = (hourIndex * angleStep - 90) * (Math.PI / 180);
    const endAngle = ((hourIndex + 1) * angleStep - 90) * (Math.PI / 180);

    // slight gap between wedges (0.015 rad)
    const gap = 0.012;
    const sa = startAngle + gap;
    const ea = endAngle - gap;

    const x1 = cx + rOut * Math.cos(sa);
    const y1 = cy + rOut * Math.sin(sa);
    const x2 = cx + rOut * Math.cos(ea);
    const y2 = cy + rOut * Math.sin(ea);

    const x3 = cx + rIn * Math.cos(ea);
    const y3 = cy + rIn * Math.sin(ea);
    const x4 = cx + rIn * Math.cos(sa);
    const y4 = cy + rIn * Math.sin(sa);

    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`;
  };

  const getSegmentColor = (classification: string, isHovered: boolean) => {
    if (isHovered) {
      if (classification === 'recoverable') return '#EAB308';
      if (classification === 'productive') return '#020617';
      if (classification === 'restorative') return '#475569';
      if (classification === 'routine') return '#64748B';
      return '#CBD5E1';
    }

    switch (classification) {
      case 'recoverable':
        return '#FACC15'; // 10% Yellow accent
      case 'productive':
        return '#0F172A'; // 30% Dark Blue
      case 'restorative':
        return '#64748B'; // Muted Slate
      case 'routine':
        return '#94A3B8'; // Light Slate
      case 'untracked':
      default:
        return '#E2E8F0'; // 60% Light Gray tone
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8F0] relative overflow-hidden">
      {/* Header bar of card */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#64748B]">24-Hour Allocation</span>
          <h3 className="text-lg font-bold text-[#0F172A]">Daily Circular Clock</h3>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
            {formatMinutes(daySummary.recoverableMinutes)} lost
          </span>
        </div>
      </div>

      {/* Radial Clock Graphic Container */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg
          viewBox="0 0 280 280"
          className="w-64 h-64 sm:w-72 sm:h-72 touch-manipulation select-none"
        >
          {/* Base Track Outline Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius + 6}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerRadius - 6}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="2"
          />

          {/* 24 Hour Segments */}
          {hourSegments.map((seg, idx) => {
            const isHovered = hoveredHour?.hour === seg.hour;
            return (
              <path
                key={seg.hour}
                d={getArcPath(idx, isHovered ? radius + 4 : radius, innerRadius)}
                fill={getSegmentColor(seg.dominantClassification, isHovered)}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredHour(seg)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={() => setHoveredHour(seg)}
              />
            );
          })}

          {/* Cardinal Hour Ticks / Markers */}
          {/* 00:00 (Top) */}
          <text x={cx} y={16} textAnchor="middle" className="text-[10px] font-mono font-semibold fill-[#64748B]">
            00:00
          </text>
          {/* 06:00 (Right) */}
          <text x={266} y={cy + 4} textAnchor="end" className="text-[10px] font-mono font-semibold fill-[#64748B]">
            06:00
          </text>
          {/* 12:00 (Bottom) */}
          <text x={cx} y={272} textAnchor="middle" className="text-[10px] font-mono font-semibold fill-[#64748B]">
            12:00
          </text>
          {/* 18:00 (Left) */}
          <text x={14} y={cy + 4} textAnchor="start" className="text-[10px] font-mono font-semibold fill-[#64748B]">
            18:00
          </text>

          {/* Center Hub Display */}
          <g className="pointer-events-none">
            <circle
              cx={cx}
              cy={cy}
              r={innerRadius - 10}
              fill="#F8FAFC"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Center Content Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-36">
          {hoveredHour ? (
            <div className="animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[11px] font-mono font-bold text-[#64748B] block">
                {hoveredHour.label} - {((hoveredHour.hour + 1) % 24).toString().padStart(2, '0')}:00
              </span>
              <span className={`text-xs font-bold uppercase tracking-wide block mt-0.5 ${
                hoveredHour.dominantClassification === 'recoverable' ? 'text-[#854D0E] font-black' :
                hoveredHour.dominantClassification === 'productive' ? 'text-[#0F172A]' :
                'text-[#475569]'
              }`}>
                {hoveredHour.dominantClassification === 'recoverable' ? 'Lost / Drift' :
                 hoveredHour.dominantClassification === 'productive' ? 'Productive' :
                 hoveredHour.dominantClassification === 'restorative' ? 'Rest / Sleep' :
                 hoveredHour.dominantClassification === 'routine' ? 'Routine' : 'Untracked'}
              </span>
              {hoveredHour.activitiesInHour.length > 0 && (
                <span className="text-[11px] font-medium text-[#1E293B] block truncate max-w-[120px] mx-auto mt-0.5">
                  {hoveredHour.activitiesInHour[0].title}
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">Today's Ratio</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-xl font-extrabold text-[#0F172A]">
                  {formatMinutes(daySummary.productiveMinutes)}
                </span>
              </div>
              <span className="text-[11px] text-[#64748B] font-medium block">
                Focus Time
              </span>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[10px] font-bold text-[#854D0E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]"></span>
                {formatMinutes(daySummary.recoverableMinutes)} Lost
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#F1F5F9] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#0F172A] shrink-0"></span>
          <span className="text-[#334155] font-medium">Productive</span>
          <span className="ml-auto text-[11px] font-mono text-[#64748B]">{formatMinutes(daySummary.productiveMinutes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#FACC15] shrink-0 border border-[#EAB308]/40"></span>
          <span className="text-[#854D0E] font-bold">Lost Hours</span>
          <span className="ml-auto text-[11px] font-mono font-semibold text-[#854D0E]">{formatMinutes(daySummary.recoverableMinutes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#64748B] shrink-0"></span>
          <span className="text-[#334155] font-medium">Rest/Sleep</span>
          <span className="ml-auto text-[11px] font-mono text-[#64748B]">{formatMinutes(daySummary.restorativeMinutes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#E2E8F0] shrink-0 border border-[#CBD5E1]"></span>
          <span className="text-[#64748B] font-medium">Untracked</span>
          <span className="ml-auto text-[11px] font-mono text-[#64748B]">{formatMinutes(daySummary.untrackedMinutes)}</span>
        </div>
      </div>
    </div>
  );
};
