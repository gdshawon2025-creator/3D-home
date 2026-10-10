import React, { useState, useCallback } from 'react';
import { ViewMode, TimeOfDay, Language, RoomInfo } from './types/office';
import { ROOMS } from './data/officeData';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { RoomModal } from './components/RoomModal';
import { TourOverlay } from './components/TourOverlay';
import { FootballModal } from './components/FootballModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('full');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [language, setLanguage] = useState<Language>('bn'); // Default to Bengali as requested, with instant toggle to English
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [inspectedRoom, setInspectedRoom] = useState<RoomInfo | null>(null);
  const [isFootballModalOpen, setIsFootballModalOpen] = useState<boolean>(false);

  // Zoom control triggers
  const [zoomTrigger, setZoomTrigger] = useState<number>(0);
  const [zoomDelta, setZoomDelta] = useState<number>(0);

  // Kick ball trigger in football view
  const [kickTrigger, setKickTrigger] = useState<number>(0);

  const handleSelectView = useCallback((view: ViewMode) => {
    setCurrentView(view);
    const room = ROOMS.find((r) => r.id === view);
    if (room) {
      setInspectedRoom(room);
      setIsFootballModalOpen(false);
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
    }
  }, []);

  const handleStartTour = useCallback(() => {
    setIsTourActive(true);
    setInspectedRoom(null);
    setIsFootballModalOpen(false);
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
      />

      {/* Top Header */}
      <Header
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        language={language}
        setLanguage={setLanguage}
        onStartTour={handleStartTour}
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

      {/* Room Details Modal */}
      {!isTourActive && inspectedRoom && (
        <RoomModal
          room={inspectedRoom}
          language={language}
          onClose={() => setInspectedRoom(null)}
        />
      )}

      {/* Football Pitch Modal */}
      {!isTourActive && isFootballModalOpen && (
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
