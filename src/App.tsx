import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Building, Inspection } from './types';
import { INITIAL_BUILDINGS, INITIAL_INSPECTIONS } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  fetchUserBuildings,
  saveUserBuilding,
  fetchUserInspections,
  saveUserInspection,
  syncUserProfile,
} from './lib/supabaseData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/views/OverviewView';
import { NewInspectionView } from './components/views/NewInspectionView';
import { BuildingsView } from './components/views/BuildingsView';
import { AssetB203View } from './components/views/AssetB203View';
import { RiskMonitorView } from './components/views/RiskMonitorView';
import { ReportsView } from './components/views/ReportsView';
import { InspectionReportModal } from './components/common/InspectionReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { ShieldCheck, RefreshCw } from 'lucide-react';

function MainApplication() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedInspectionForModal, setSelectedInspectionForModal] = useState<Inspection | null>(null);

  // Buildings and Inspections state
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Target building for specific deep-dive views
  const [selectedBuilding, setSelectedBuilding] = useState<Building>(
    buildings.find((b) => b.code === 'B-203') || buildings[0]
  );

  // Load user data on auth user change / mount
  const loadUserData = useCallback(async () => {
    if (!user) return;
    const userId = user.id;
    setIsLoadingData(true);
    try {
      syncUserProfile(user).catch(() => {});

      const [userBuildings, userInspections] = await Promise.all([
        fetchUserBuildings(userId),
        fetchUserInspections(userId),
      ]);

      if (userBuildings && userBuildings.length > 0) {
        setBuildings(userBuildings);
        const b203 = userBuildings.find((b) => b.code === 'B-203');
        if (b203) {
          setSelectedBuilding(b203);
        } else {
          setSelectedBuilding(userBuildings[0]);
        }
      }

      if (userInspections) {
        setInspections(userInspections);
      }
    } catch (err) {
      console.error('Error loading Supabase user data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Handle adding a new building (+ Add Building)
  const handleAddBuilding = async (newBuilding: Building) => {
    const userId = user?.id || 'default_guest';
    const buildingWithUser = { ...newBuilding, userId };

    // Optimistic state update
    setBuildings((prev) => [buildingWithUser, ...prev.filter((b) => b.id !== buildingWithUser.id)]);

    // Save to Supabase table & local cache
    try {
      await saveUserBuilding(userId, buildingWithUser);
    } catch (err) {
      console.error('Failed to save building to Supabase:', err);
    }
  };

  // Handle saving a new forensic inspection
  const handleSaveInspection = async (newInspection: Inspection) => {
    const userId = user?.id || 'default_guest';
    const inspectionWithUser = { ...newInspection, userId };

    // Update local inspections list
    setInspections((prev) => [inspectionWithUser, ...prev]);

    // Update target building metrics
    setBuildings((prevBuildings) =>
      prevBuildings.map((b) => {
        if (b.id === newInspection.buildingId || b.code === newInspection.buildingCode) {
          const newCriticalCount =
            newInspection.overallRiskLevel === 'Critical'
              ? b.criticalDefectsCount + 1
              : b.criticalDefectsCount;

          return {
            ...b,
            healthIndex: Math.min(b.healthIndex, newInspection.structuralHealthIndex),
            riskStatus:
              newInspection.overallRiskLevel === 'Critical'
                ? 'Critical'
                : newInspection.overallRiskLevel === 'High' && b.riskStatus !== 'Critical'
                ? 'High'
                : b.riskStatus === 'Unassessed'
                ? newInspection.overallRiskLevel
                : b.riskStatus,
            totalInspections: b.totalInspections + 1,
            criticalDefectsCount: newCriticalCount,
            lastInspectionDate: newInspection.date,
          };
        }
        return b;
      })
    );

    // Save to Supabase 'inspections', 'defects', 'reports' tables
    try {
      await saveUserInspection(userId, inspectionWithUser);
    } catch (err) {
      console.error('Failed to save inspection to Supabase:', err);
    }
  };

  // Show loading indicator while session initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
          <span>Verifying StructuralAI Security Session...</span>
        </div>
      </div>
    );
  }

  // STRICT AUTHENTICATION FIRST: If not logged in, render AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

  const b203Building = buildings.find((b) => b.code === 'B-203') || buildings[0];
  const criticalAlertCount = buildings.filter((b) => b.riskStatus === 'Critical').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
        criticalCount={criticalAlertCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openAuthModal={() => setIsAuthModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          criticalAlertCount={criticalAlertCount}
        />

        {/* View Switcher */}
        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <OverviewView
              buildings={buildings}
              inspections={inspections}
              setActiveTab={setActiveTab}
              onSelectInspection={(insp) => setSelectedInspectionForModal(insp)}
              onSelectBuilding={(b) => {
                setSelectedBuilding(b);
                setActiveTab('buildings');
              }}
            />
          )}

          {activeTab === 'new-inspection' && (
            <NewInspectionView
              buildings={buildings}
              onSaveInspection={handleSaveInspection}
              setActiveTab={setActiveTab}
              onViewReport={(insp) => setSelectedInspectionForModal(insp)}
            />
          )}

          {activeTab === 'buildings' && (
            <BuildingsView
              buildings={buildings}
              setActiveTab={setActiveTab}
              onSelectBuilding={(b) => {
                if (b.code === 'B-203') {
                  setActiveTab('b-203');
                } else {
                  setSelectedBuilding(b);
                }
              }}
              onAddBuilding={handleAddBuilding}
            />
          )}

          {activeTab === 'b-203' && (
            <AssetB203View
              building={b203Building}
              inspections={inspections.filter(
                (i) => i.buildingCode === 'B-203' || i.buildingId === b203Building?.id
              )}
              setActiveTab={setActiveTab}
              onSelectInspection={(insp) => setSelectedInspectionForModal(insp)}
            />
          )}

          {activeTab === 'risk-monitor' && (
            <RiskMonitorView
              buildings={buildings}
              inspections={inspections}
              setActiveTab={setActiveTab}
              onSelectBuilding={(b) => {
                setSelectedBuilding(b);
                setActiveTab('buildings');
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              inspections={inspections}
              buildings={buildings}
              onSelectInspection={(insp) => setSelectedInspectionForModal(insp)}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Audit Certificate / Inspection Report Modal */}
      {selectedInspectionForModal && (
        <InspectionReportModal
          inspection={selectedInspectionForModal}
          building={
            buildings.find(
              (b) =>
                b.id === selectedInspectionForModal.buildingId ||
                b.code === selectedInspectionForModal.buildingCode
            ) || b203Building
          }
          onClose={() => setSelectedInspectionForModal(null)}
        />
      )}

      {/* Profile & Account Details Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}

export default App;
