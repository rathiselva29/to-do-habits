import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { StreakCelebration } from './components/StreakCelebration';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { SplashView } from './components/SplashView';
import { RootAuthView } from './components/RootAuthView';
import { HabitCreatorModal } from './components/HabitCreatorModal';
import { HabitDetailsModal } from './components/HabitDetailsModal';
import { DashboardView } from './components/DashboardView';
import { HabitsView } from './components/HabitsView';
import { AICoachView } from './components/AICoachView';
import { MoodTrackerView } from './components/MoodTrackerView';
import { HealthMetricsView } from './components/HealthMetricsView';
import { AnalyticsView } from './components/AnalyticsView';
import { CalendarView } from './components/CalendarView';
import { ProfileView } from './components/ProfileView';
import { Habit } from './types';
import { Logo } from './components/Logo';

function AppContent() {
  const { user, isAuthenticated, isLoading, loginAsGuestDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitForDetails, setSelectedHabitForDetails] = useState<Habit | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Unauthenticated screen state: Splash vs Login / Sign Up
  const [showSplash, setShowSplash] = useState(true);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot'>('login');

  const handleOpenEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setSelectedHabitForDetails(null);
    setIsNewHabitOpen(true);
  };

  const handleCloseHabitModal = () => {
    setIsNewHabitOpen(false);
    setEditingHabit(null);
  };

  // 1. Loading State during authentication verification
  if (isLoading) {
    return (
      <div className="min-h-screen frosted-bg flex flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Logo size={44} showText={true} />
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Flow: Splash Screen & Login / Register View
  if (!isAuthenticated || !user) {
    if (showSplash) {
      return (
        <SplashView
          onGetStarted={() => {
            setAuthInitialMode('register');
            setShowSplash(false);
          }}
          onSignIn={() => {
            setAuthInitialMode('login');
            setShowSplash(false);
          }}
          onQuickDemo={() => {
            loginAsGuestDemo();
          }}
        />
      );
    }
    return (
      <RootAuthView
        initialMode={authInitialMode}
        onBackToSplash={() => setShowSplash(true)}
      />
    );
  }

  // 3. Authenticated but First Time User: 3-Step Guided Onboarding Flow
  if (!user.isOnboarded) {
    return (
      <div className="min-h-screen frosted-bg flex flex-col items-center justify-center p-4">
        <OnboardingModal />
      </div>
    );
  }

  // 4. Authenticated & Onboarded: Full Workspace Dashboard
  return (
    <div className="min-h-screen frosted-bg text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Offline Status & Sync Alert */}
      <OfflineBanner />

      {/* App Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsNewHabitOpen(true);
        }}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sticky & Mobile Drawer Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewHabit={() => {
            setEditingHabit(null);
            setIsNewHabitOpen(true);
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewHabit={() => {
                setEditingHabit(null);
                setIsNewHabitOpen(true);
              }}
              onOpenHabitDetails={(habit) => setSelectedHabitForDetails(habit)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsView
              onOpenNewHabit={() => {
                setEditingHabit(null);
                setIsNewHabitOpen(true);
              }}
              onOpenHabitDetails={(habit) => setSelectedHabitForDetails(habit)}
              onEditHabit={handleOpenEditHabit}
            />
          )}

          {activeTab === 'coach' && <AICoachView />}

          {activeTab === 'mood' && <MoodTrackerView />}

          {activeTab === 'health' && <HealthMetricsView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'calendar' && <CalendarView />}

          {activeTab === 'profile' && (
            <ProfileView onOpenAuth={() => setIsAuthOpen(true)} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Overlays */}
      <StreakCelebration />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <HabitCreatorModal
        isOpen={isNewHabitOpen}
        onClose={handleCloseHabitModal}
        initialHabit={editingHabit}
      />

      <HabitDetailsModal
        habit={selectedHabitForDetails}
        isOpen={!!selectedHabitForDetails}
        onClose={() => setSelectedHabitForDetails(null)}
        onEdit={handleOpenEditHabit}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
