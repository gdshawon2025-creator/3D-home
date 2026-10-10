import React, { useState, useCallback } from 'react';
import { ViewMode, TimeOfDay, Language, RoomInfo, CampusConfig, CameraMode } from './types/office';
import { ROOMS } from './data/officeData';
import { CAMPUS_PEOPLE, PersonProfile } from './data/peopleData';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { RoomModal } from './components/RoomModal';
import { TourOverlay } from './components/TourOverlay';
import { FootballModal } from './components/FootballModal';
import { PersonModal } from './components/PersonModal';
import { BossController } from './components/BossController';
import { CustomizerPanel } from './components/CustomizerPanel';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('full');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [language, setLanguage] = useState<Language>('bn');
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [inspectedRoom, setInspectedRoom] = useState<RoomInfo | null>(null);
  const [isFootballModalOpen, setIsFootballModalOpen] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);

  // Campus Customizer & Control State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [campusConfig, setCampusConfig] = useState<CampusConfig>({
    buildingTheme: 'emerald',
    cameraMode: 'orbit',
    weather: 'sunny',
    sunIntensity: 1.0,
    ambientIntensity: 1.0,
    trafficSpeed: 1.0,
    cutawayRoofs: false,
    bossSpeed: 0.12,
    activeInteriorRoom: null,
  });

  // Boss Interactive Position & Control
  const [bossPos, setBossPos] = useState<[number, number, number]>([-4.0, 6.3, -3.2]);
  const [bossTargetTeleport, setBossTargetTeleport] = useState<[number, number, number] | null>(null);
  const [manualBossMove, setManualBossMove] = useState<{ dx: number; dz: number; tick: number } | null>(null);

  // Zoom control triggers
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [zoomDelta, setZoomDelta] = useState<number>(0);

  // Kick ball trigger in football view
  const [kickTrigger, setKickTrigger] = useState<number>(0);

  // Campus-wide celebration trigger for people
  const [celebrateTrigger, setCelebrateTrigger] = useState<number>(0);

  const handleSelectView = useCallback((view: ViewMode) => {
    setCurrentView(view);
    const room = ROOMS.find((r) => r.id === view);
    if (room) {
      setInspectedRoom(room);
      setIsFootballModalOpen(false);
      setSelectedPerson(null);
    } else if (view === 'football') {
      setIsFootballModalOpen(true);
      setInspectedRoom(null);
    } else {
      setInspectedRoom(null);
      setIsFootballModalOpen(false);
    }
  }, []);

  const handleInspectRoom = useCallback((view: ViewMode) => {
    const room = ROOMS.find((r) => r.id === view);
    if (room) {
      setInspectedRoom(room);
      setIsFootballModalOpen(false);
      setSelectedPerson(null);
    }
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourActive(true);
    setInspectedRoom(null);
    setIsFootballModalOpen(false);
    setSelectedPerson(null);
    setIsCustomizerOpen(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomDelta(-1);
    setZoomTrigger((t) => t + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomDelta(1);
    setZoomTrigger((t) => t + 1);
  }, []);

  const handleKickBall = useCallback(() => {
    setKickTrigger((k) => k + 1);
  }, []);

  const handleCelebrateAll = useCallback(() => {
    setCelebrateTrigger((c) => c + 1);
  }, []);

  // Boss Controller Actions
  const handleMoveBoss = useCallback((dx: number, dz: number) => {
    setManualBossMove((prev) => ({
      dx,
      dz,
      tick: (prev?.tick || 0) + 1,
    }));
  }, []);

  const handleTeleportBoss = useCallback((pos: [number, number, number], viewName?: ViewMode) => {
    setBossTargetTeleport([...pos]);
    if (viewName) {
      setCurrentView(viewName);
    }
  }, []);

  const handleSetCameraMode = useCallback((mode: CameraMode) => {
    setCampusConfig((prev) => ({ ...prev, cameraMode: mode }));
  }, []);

  const handleEnterInterior = useCallback((roomId: ViewMode) => {
    setCampusConfig((prev) => ({
      ...prev,
      cutawayRoofs: true,
      activeInteriorRoom: roomId,
    }));
    setCurrentView(roomId);
    const room = ROOMS.find((r) => r.id === roomId);
    if (room) {
      setBossTargetTeleport([...room.interiorPosition]);
    }
  }, []);

  const handleExitInterior = useCallback(() => {
    setCampusConfig((prev) => ({
      ...prev,
      cutawayRoofs: false,
      activeInteriorRoom: null,
      cameraMode: 'orbit',
    }));
    setCurrentView('full');
  }, []);

  const handleChangeConfig = useCallback((updates: Partial<CampusConfig>) => {
    setCampusConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleResetDefaults = useCallback(() => {
    setCampusConfig({
      buildingTheme: 'emerald',
      cameraMode: 'orbit',
      weather: 'sunny',
      sunIntensity: 1.0,
      ambientIntensity: 1.0,
      trafficSpeed: 1.0,
      cutawayRoofs: false,
      bossSpeed: 0.12,
      activeInteriorRoom: null,
    });
  }, []);

  const isInsideBuilding = !!campusConfig.activeInteriorRoom || campusConfig.cutawayRoofs;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#d7e6e0] font-sans select-none">
      {/* 3D Canvas Layer */}
      <ThreeCanvas
        currentView={currentView}
        onSelectView={handleSelectView}
        timeOfDay={timeOfDay}
        language={language}
        onInspectRoom={handleInspectRoom}
        zoomTrigger={zoomTrigger}
        zoomDelta={zoomDelta}
        celebrateTrigger={celebrateTrigger}
        selectedPerson={selectedPerson}
        onSelectPerson={setSelectedPerson}
        campusConfig={campusConfig}
        onUpdateBossPos={setBossPos}
        bossTargetTeleport={bossTargetTeleport}
        manualBossMove={manualBossMove}
        onEnterInteriorRoom={handleEnterInterior}
      />

      {/* Top Header */}
      <Header
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        language={language}
        setLanguage={setLanguage}
        onStartTour={handleStartTour}
        peopleCount={CAMPUS_PEOPLE.length}
        onCelebrateAll={handleCelebrateAll}
        onOpenCustomizer={() => setIsCustomizerOpen((prev) => !prev)}
      />

      {/* Left Sidebar (Only visible when tour is not active) */}
      {!isTourActive && (
        <Sidebar
          currentView={currentView}
          onSelectView={handleSelectView}
          language={language}
          onInspectRoom={handleInspectRoom}
          onStartTour={handleStartTour}
        />
      )}

      {/* Boss Character Controller & Steering Widget */}
      {!isTourActive && (
        <BossController
          language={language}
          cameraMode={campusConfig.cameraMode}
          onSetCameraMode={handleSetCameraMode}
          onMoveBoss={handleMoveBoss}
          onTeleportBoss={handleTeleportBoss}
          bossPos={bossPos}
          isInsideBuilding={isInsideBuilding}
          activeRoomId={campusConfig.activeInteriorRoom || (inspectedRoom ? inspectedRoom.id : null)}
          onEnterInterior={handleEnterInterior}
          onExitInterior={handleExitInterior}
        />
      )}

      {/* Full Campus Customizer Panel (Themes, Cutaway Roofs, Weather, Lighting, Speed) */}
      <CustomizerPanel
        language={language}
        config={campusConfig}
        onChangeConfig={handleChangeConfig}
        onResetDefaults={handleResetDefaults}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      {/* Room Details Modal */}
      {!isTourActive && inspectedRoom && !selectedPerson && (
        <RoomModal
          room={inspectedRoom}
          language={language}
          onClose={() => setInspectedRoom(null)}
        />
      )}

      {/* Person Profile & Speech Bubble Modal */}
      {!isTourActive && selectedPerson && (
        <PersonModal
          person={selectedPerson}
          language={language}
          onClose={() => setSelectedPerson(null)}
          onCheerPerson={handleCelebrateAll}
          onKickBall={handleKickBall}
        />
      )}

      {/* Football Pitch Modal */}
      {!isTourActive && isFootballModalOpen && !selectedPerson && (
        <FootballModal
          language={language}
          onKick={handleKickBall}
          onClose={() => setIsFootballModalOpen(false)}
        />
      )}

      {/* Bottom Bar Controls (Only when tour is not active) */}
      {!isTourActive && (
        <BottomBar
          currentView={currentView}
          onSelectView={handleSelectView}
          language={language}
          onStartTour={handleStartTour}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}

      {/* Interactive Guided Tour Mode */}
      {isTourActive && (
        <TourOverlay
          language={language}
          onSelectView={setCurrentView}
          onClose={() => {
            setIsTourActive(false);
            setCurrentView('full');
          }}
        />
      )}
    </div>
  );
}
