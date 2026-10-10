import * as THREE from 'three';

/**
 * Builds rich, detailed 3D interior architecture and furniture
 * for all 7 buildings/rooms on the campus.
 */
export function buildCampusInteriors(): {
  group: THREE.Group;
  roomGroups: Record<string, THREE.Group>;
} {
  const masterGroup = new THREE.Group();
  const roomGroups: Record<string, THREE.Group> = {};

  // Common furniture materials
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.5 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const leatherBlackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
  const leatherBrownMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const metalChromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.2 });
  const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const codeScreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const plantLeafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  const potMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const poolFeltMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.6 });

  // Helper: Potted Plant
  const createPlant = (x: number, y: number, z: number, scale = 1) => {
    const plant = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.09 * scale, 0.25 * scale, 12), potMat);
    pot.position.y = 0.125 * scale;
    plant.add(pot);

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 * scale, 1), plantLeafMat);
    foliage.position.y = 0.35 * scale;
    foliage.castShadow = true;
    plant.add(foliage);
    plant.position.set(x, y, z);
    return plant;
  };

  // Helper: Office Chair
  const createOfficeChair = (x: number, y: number, z: number, rotY = 0) => {
    const chair = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.12, 0.22, 5), metalChromeMat);
    base.position.y = 0.11;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.24), leatherBlackMat);
    seat.position.y = 0.24;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.03), leatherBlackMat);
    back.position.set(0, 0.40, -0.11);
    chair.add(base, seat, back);
    chair.position.set(x, y, z);
    chair.rotation.y = rotY;
    return chair;
  };

  // Helper: Dual Monitor Desk
  const createDevDesk = (x: number, y: number, z: number, rotY = 0) => {
    const desk = new THREE.Group();
    // Desktop & legs
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), whiteMat);
    top.position.y = 0.42;
    top.castShadow = true;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.55), metalChromeMat);
    legL.position.set(-0.55, 0.21, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.55), metalChromeMat);
    legR.position.set(0.55, 0.21, 0);
    desk.add(top, legL, legR);

    // Dual monitors
    [-0.22, 0.22].forEach((mx) => {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16), metalChromeMat);
      stand.position.set(mx, 0.52, -0.15);
      const display = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.02), darkWoodMat);
      display.position.set(mx, 0.65, -0.15);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.20), codeScreenMat);
      screen.position.set(mx, 0.65, -0.138);
      desk.add(stand, display, screen);
    });

    // Keyboard & Mousepad
    const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.01, 0.1), darkWoodMat);
    kbd.position.set(0, 0.445, 0.08);
    desk.add(kbd);

    desk.position.set(x, y, z);
    desk.rotation.y = rotY;
    return desk;
  };

  // ==========================================
  // 1. RECEPTION ATRIUM (Building 1 Ground)
  // ==========================================
  const receptionGroup = new THREE.Group();
  receptionGroup.position.set(-4, 0.28, -1.8);
  roomGroups.reception = receptionGroup;

  // Polished marble floor tile
  const recFloor = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.04, 3.8), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 }));
  recFloor.position.y = 0.02;
  receptionGroup.add(recFloor);

  // Modern Curved Reception Desk
  const recDesk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.7, 16, 1, false, 0, Math.PI), whiteMat);
  recDesk.rotation.y = Math.PI;
  recDesk.position.set(0, 0.35, -0.8);
  recDesk.castShadow = true;
  receptionGroup.add(recDesk);

  // Computer terminal behind desk
  const recComp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.24, 0.02), screenGlowMat);
  recComp.position.set(0, 0.85, -0.8);
  receptionGroup.add(recComp);

  // Plush velvet couches for waiting visitors
  const couchL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 }));
  couchL.position.set(-1.4, 0.22, 0.6);
  couchL.rotation.y = Math.PI / 2;
  const couchR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 }));
  couchR.position.set(1.4, 0.22, 0.6);
  couchR.rotation.y = -Math.PI / 2;
  receptionGroup.add(couchL, couchR);

  // Glass coffee table in waiting lounge
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.6), glassMat);
  tableTop.position.set(0, 0.26, 0.6);
  receptionGroup.add(tableTop);

  receptionGroup.add(createPlant(-1.8, 0, -1.2, 1.1));
  receptionGroup.add(createPlant(1.8, 0, -1.2, 1.1));
  masterGroup.add(receptionGroup);

  // ==========================================
  // 2. WORK STUDIO (Building 2 Level 1)
  // ==========================================
  const studioGroup = new THREE.Group();
  studioGroup.position.set(7, 0.28, -3.2);
  roomGroups.studio = studioGroup;

  // Oak wood flooring
  const studioFloor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.04, 6.4), woodMat);
  studioFloor.position.y = 0.02;
  studioGroup.add(studioFloor);

  // 4 Developer Pods
  studioGroup.add(createDevDesk(-1.1, 0, -1.6, 0));
  studioGroup.add(createOfficeChair(-1.1, 0, -1.1, 0));

  studioGroup.add(createDevDesk(1.1, 0, -1.6, 0));
  studioGroup.add(createOfficeChair(1.1, 0, -1.1, 0));

  studioGroup.add(createDevDesk(-1.1, 0, 1.4, Math.PI));
  studioGroup.add(createOfficeChair(-1.1, 0, 0.9, Math.PI));

  studioGroup.add(createDevDesk(1.1, 0, 1.4, Math.PI));
  studioGroup.add(createOfficeChair(1.1, 0, 0.9, Math.PI));

  // Wall collaboration whiteboard
  const wb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.03), whiteMat);
  wb.position.set(0, 1.6, -3.15);
  studioGroup.add(wb);
  studioGroup.add(createPlant(1.7, 0, 2.6, 0.9));
  masterGroup.add(studioGroup);

  // ==========================================
  // 3. DESIGN ROOM (Building 2 Level 2)
  // ==========================================
  const designGroup = new THREE.Group();
  designGroup.position.set(7, 2.58, -6.8);
  roomGroups.design = designGroup;

  const designFloor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.04, 3.2), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }));
  designFloor.position.y = 0.02;
  designGroup.add(designFloor);

  // Large drafting table with Wacom Cintiq
  const draftingTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.9), darkWoodMat);
  draftingTable.position.set(0, 0.55, 0);
  draftingTable.rotation.x = 0.15;
  const cintiq = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.03), new THREE.MeshBasicMaterial({ color: 0xec4899 }));
  cintiq.position.set(0, 0.65, 0.05);
  cintiq.rotation.x = 0.2;
  designGroup.add(draftingTable, cintiq);

  // Moodboard color wall
  const moodWall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 0.04), new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
  moodWall.position.set(0, 1.2, -1.55);
  designGroup.add(moodWall);

  masterGroup.add(designGroup);

  // ==========================================
  // 4. GLASS BOARDROOM (Building 4)
  // ==========================================
  const meetingGroup = new THREE.Group();
  meetingGroup.position.set(-7, 2.58, -7.0);
  roomGroups.meeting = meetingGroup;

  const meetFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.04, 3.6), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }));
  meetFloor.position.y = 0.02;
  meetingGroup.add(meetFloor);

  // Long executive conference table
  const confTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 1.2), darkWoodMat);
  confTable.position.set(0, 0.45, 0);
  confTable.castShadow = true;
  meetingGroup.add(confTable);

  // 6 Chairs around table
  [-0.7, 0, 0.7].forEach((cx) => {
    meetingGroup.add(createOfficeChair(cx, 0, -0.8, 0));
    meetingGroup.add(createOfficeChair(cx, 0, 0.8, Math.PI));
  });

  // 85" Presentation Wall Screen
  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  tvScreen.position.set(0, 1.4, -1.75);
  meetingGroup.add(tvScreen);

  masterGroup.add(meetingGroup);

  // ==========================================
  // 5. MISSION OPERATIONS (Building 3 Ground)
  // ==========================================
  const opsGroup = new THREE.Group();
  opsGroup.position.set(-8, 0.28, 2.0);
  roomGroups.operations = opsGroup;

  const opsFloor = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 4.0), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
  opsFloor.position.y = 0.02;
  opsGroup.add(opsFloor);

  // Server rack cabinets with blinking LEDs
  [-1.0, 0, 1.0].forEach((rx) => {
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), leatherBlackMat);
    rack.position.set(rx, 0.8, -1.6);
    const ledStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.4), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    ledStrip.position.set(rx, 0.8, -1.34);
    opsGroup.add(rack, ledStrip);
  });

  // Massive curved telemetry screen
  const teleScreen = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 0.04), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  teleScreen.position.set(0, 1.2, 1.95);
  teleScreen.rotation.y = Math.PI;
  opsGroup.add(teleScreen);

  masterGroup.add(opsGroup);

  // ==========================================
  // 6. ROOFTOP LOUNGE & POOL TABLE (Building 5)
  // ==========================================
  const loungeGroup = new THREE.Group();
  loungeGroup.position.set(0, 3.48, -8.0);
  roomGroups.lounge = loungeGroup;

  const loungeFloor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.04, 3.4), woodMat);
  loungeFloor.position.y = 0.02;
  loungeGroup.add(loungeFloor);

  // Tournament Billiards / Pool Table
  const poolTable = new THREE.Group();
  const poolBed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.9), poolFeltMat);
  poolBed.position.y = 0.45;
  const poolCushion = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.0), darkWoodMat);
  poolCushion.position.y = 0.43;
  // Pool balls on table
  const ballCluster = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), whiteMat);
  ballCluster.position.set(0.3, 0.52, 0);
  poolTable.add(poolCushion, poolBed, ballCluster);
  poolTable.position.set(-1.2, 0, 0);
  loungeGroup.add(poolTable);

  // Espresso Specialty Bar
  const coffeeBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 0.5), whiteMat);
  coffeeBar.position.set(1.4, 0.325, -1.0);
  const espressoMachine = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.35), metalChromeMat);
  espressoMachine.position.set(1.4, 0.825, -1.0);
  loungeGroup.add(coffeeBar, espressoMachine);

  masterGroup.add(loungeGroup);

  // ==========================================
  // 7. BOSS CABIN PENTHOUSE (Building 1 Top)
  // ==========================================
  const cabinGroup = new THREE.Group();
  cabinGroup.position.set(-4, 6.18, -3.0);
  roomGroups.cabin = cabinGroup;

  // Walnut parquet flooring
  const cabinFloor = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.04, 2.3), darkWoodMat);
  cabinFloor.position.y = 0.02;
  cabinGroup.add(cabinFloor);

  // Executive Mahogany Desk
  const ceoDesk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.48, 0.7), darkWoodMat);
  ceoDesk.position.set(0, 0.24, -0.3);
  ceoDesk.castShadow = true;

  // CEO High-back leather armchair
  const ceoChair = createOfficeChair(0, 0, -0.75, 0);
  cabinGroup.add(ceoDesk, ceoChair);

  // MacBook Pro laptop on desk
  const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.16), metalChromeMat);
  laptop.position.set(0, 0.49, -0.3);
  cabinGroup.add(laptop);

  // Bookshelf with leather volumes
  const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.8), darkWoodMat);
  bookshelf.position.set(-1.15, 0.6, 0.4);
  bookshelf.rotation.y = Math.PI / 2;
  cabinGroup.add(bookshelf);

  // Brass telescope pointed toward coastal ocean view
  const telescope = new THREE.Group();
  const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 0.6, 3), metalChromeMat);
  tripod.position.y = 0.3;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 }));
  tube.position.set(0, 0.62, 0);
  tube.rotation.x = -0.4;
  telescope.add(tripod, tube);
  telescope.position.set(0.9, 0, 0.6);
  cabinGroup.add(telescope);

  masterGroup.add(cabinGroup);

  return {
    group: masterGroup,
    roomGroups,
  };
}
