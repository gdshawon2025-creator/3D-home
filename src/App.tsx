import React, { useState, useCallback } from 'react';
import { ViewMode, TimeOfDay, Language, RoomInfo } from './types/office';
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

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('full');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [language, setLanguage] = useState<Language>('bn');
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [inspectedRoom, setInspectedRoom] = useState<RoomInfo | null>(null);
  const [isFootballModalOpen, setIsFootballModalOpen] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);

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
