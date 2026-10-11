/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeView } from './components/home/HomeView';
import { TimelineView } from './components/timeline/TimelineView';
import { LostHoursView } from './components/losthours/LostHoursView';
import { ProfileView } from './components/profile/ProfileView';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { AddActivityModal } from './components/timeline/AddActivityModal';
import { WeeklyInsightsModal } from './components/insights/WeeklyInsightsModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#F0F2F6] text-[#0F172A] font-sans">
      {/* Centered Mobile-First Frame / Desktop Responsive Container */}
      <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFC] shadow-xl sm:border-x sm:border-[#CBD5E1] flex flex-col relative">
        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-4 pb-20">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'lost-hours' && <LostHoursView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Global Modals */}
        <AddActivityModal />
        <WeeklyInsightsModal />

        {/* Four-Destination Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
