import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ViewMode, TimeOfDay, Language } from '../types/office';
import { CAMERA_PRESETS, ROOMS } from '../data/officeData';
import { CAMPUS_PEOPLE, PersonProfile } from '../data/peopleData';
import { soundManager } from '../utils/audio';

interface ThreeCanvasProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  timeOfDay: TimeOfDay;
  language: Language;
  onInspectRoom?: (view: ViewMode) => void;
  zoomTrigger?: number; // increments to trigger zoom in/out
  zoomDelta?: number;
  celebrateTrigger?: number;
  selectedPerson?: PersonProfile | null;
  onSelectPerson?: (p: PersonProfile | null) => void;
}

interface PersonPin {
  person: PersonProfile;
  x: number;
  y: number;
  visible: boolean;
}

interface ScreenPin {
  id: ViewMode | 'you' | 'lighthouse';
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  visible: boolean;
  color: string;
  isYou?: boolean;
}

interface CharacterInstance {
  profile: PersonProfile;
  group: THREE.Group;
  spine: THREE.Group;
  leftLegHip: THREE.Group;
  leftKnee: THREE.Group;
  rightLegHip: THREE.Group;
  rightKnee: THREE.Group;
  leftArmShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightArmShoulder: THREE.Group;
  rightElbow: THREE.Group;
  head: THREE.Group;
  walkPhase: number;
  walkSpeed: number;
  walkTargetIdx: number;
  currentPos: THREE.Vector3;
  basePos: THREE.Vector3;
  cheerTime: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentView,
  onSelectView,
  timeOfDay,
  language,
  onInspectRoom,
  zoomTrigger,
  zoomDelta,
  celebrateTrigger,
  selectedPerson,
  onSelectPerson,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [screenPins, setScreenPins] = useState<ScreenPin[]>([]);
  const [screenPeoplePins, setScreenPeoplePins] = useState<PersonPin[]>([]);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Characters refs
  const charactersRef = useRef<CharacterInstance[]>([]);

  // Lighting refs for time-of-day changes
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const streetLightsRef = useRef<THREE.PointLight[]>([]);
  const windowMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Moving elements refs
  const carsRef = useRef<{ mesh: THREE.Group; speed: number; angle: number; radius: number; centerX: number; centerZ: number }[]>([]);
  const lighthouseBeamRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const fountainParticlesRef = useRef<THREE.Points | null>(null);
  const soccerBallRef = useRef<THREE.Mesh | null>(null);
  const ballVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Camera animation target refs
  const currentCamPos = useRef<THREE.Vector3>(new THREE.Vector3(24, 22, 24));
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(24, 22, 24));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // User Orbit / Pan controls state
  const isDragging = useRef<boolean>(false);
  const dragButton = useRef<number>(0); // 0 = left, 2 = right
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitSpherical = useRef<THREE.Spherical>(new THREE.Spherical(40, Math.PI / 4, Math.PI / 4));

  // 3D Pin Anchor Coordinates
  const pinAnchors = useRef<Record<string, THREE.Vector3>>({
    you: new THREE.Vector3(-4, 7.5, -3), // Headquarters penthouse
    reception: new THREE.Vector3(-4, 3.2, 0),
    studio: new THREE.Vector3(7, 4.4, -2),
    design: new THREE.Vector3(7, 5.2, -8),
    meeting: new THREE.Vector3(-7, 5.5, -7),
    operations: new THREE.Vector3(-8, 4.0, 2),
    lounge: new THREE.Vector3(0, 5.8, -8),
    cabin: new THREE.Vector3(-4, 6.8, -3),
    football: new THREE.Vector3(0, 1.4, 3),
    lighthouse: new THREE.Vector3(20, 6, -22),
  });

  // Handle external zoom controls
  useEffect(() => {
    if (!zoomTrigger || !zoomDelta || !cameraRef.current) return;
    const cam = cameraRef.current;
    const dir = new THREE.Vector3().subVectors(cam.position, targetLookAt.current).normalize();
    const newPos = cam.position.clone().addScaledVector(dir, zoomDelta * 4);
    const dist = newPos.distanceTo(targetLookAt.current);
    if (dist > 6 && dist < 65) {
      targetCamPos.current.copy(newPos);
    }
  }, [zoomTrigger, zoomDelta]);

  // Handle view switch
  useEffect(() => {
    const preset = CAMERA_PRESETS[currentView] || CAMERA_PRESETS.full;
    targetCamPos.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);

    // Update spherical coords for continuous orbit from new viewpoint
    const offset = new THREE.Vector3().subVectors(targetCamPos.current, targetLookAt.current);
    orbitSpherical.current.setFromVector3(offset);

    soundManager.playTransition();
  }, [currentView]);

  // Handle kick ball interaction
  const kickBall = useCallback(() => {
    if (!soccerBallRef.current) return;
    soundManager.playKick();
    ballVelocityRef.current.set(
      (Math.random() - 0.5) * 8,
      4 + Math.random() * 3,
      (Math.random() - 0.5) * 8
    );
    charactersRef.current.forEach((char) => {
      if (char.profile.category === 'footballer') {
        char.cheerTime = 2.5;
      }
    });
  }, []);

  // Trigger campus-wide celebration
  useEffect(() => {
    if (!celebrateTrigger) return;
    charactersRef.current.forEach((char) => {
      char.cheerTime = 4.0;
    });
  }, [celebrateTrigger]);

  // Update time of day lighting
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !rendererRef.current || !sceneRef.current) return;

    const dirLight = dirLightRef.current;
    const hemiLight = hemiLightRef.current;

    if (timeOfDay === 'day') {
      sceneRef.current.background = new THREE.Color(0xd7e6e0);
      sceneRef.current.fog = new THREE.FogExp2(0xd7e6e0, 0.012);
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0xaec3b0);
      hemiLight.intensity = 0.9;
      dirLight.color.setHex(0xfffaed);
      dirLight.intensity = 1.3;
      dirLight.position.set(24, 36, 18);

      streetLightsRef.current.forEach((l) => (l.intensity = 0));
      windowMaterialsRef.current.forEach((m) => {
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
      });
      if (lighthouseBeamRef.current) lighthouseBeamRef.current.visible = false;
    } else if (timeOfDay === 'sunset') {
      sceneRef.current.background = new THREE.Color(0xf6d6bd);
      sceneRef.current.fog = new THREE.FogExp2(0xf6d6bd, 0.012);
      hemiLight.color.setHex(0xfdcba1);
      hemiLight.groundColor.setHex(0x7c584a);
      hemiLight.intensity = 0.7;
      dirLight.color.setHex(0xff8c42);
      dirLight.intensity = 1.5;
      dirLight.position.set(35, 18, 12);

      streetLightsRef.current.forEach((l) => (l.intensity = 0.8));
      windowMaterialsRef.current.forEach((m) => {
        m.emissive.setHex(0xffd166);
        m.emissiveIntensity = 0.4;
      });
      if (lighthouseBeamRef.current) lighthouseBeamRef.current.visible = true;
    } else {
      // Night
      sceneRef.current.background = new THREE.Color(0x0f172a);
      sceneRef.current.fog = new THREE.FogExp2(0x0f172a, 0.015);
      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.35;
      dirLight.color.setHex(0x60a5fa);
      dirLight.intensity = 0.45;
      dirLight.position.set(15, 30, 10);

      streetLightsRef.current.forEach((l) => (l.intensity = 2.0));
      windowMaterialsRef.current.forEach((m) => {
        m.emissive.setHex(0xfef08a);
        m.emissiveIntensity = 0.9;
      });
      if (lighthouseBeamRef.current) lighthouseBeamRef.current.visible = true;
    }
  }, [timeOfDay]);

  // Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xd7e6e0);
    scene.fog = new THREE.FogExp2(0xd7e6e0, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.5, 200);
    camera.position.set(24, 22, 24);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaec3b0, 0.9);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    dirLight.position.set(24, 36, 18);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const shadowD = 28;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Palette & Shared Materials
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x98b89f, roughness: 0.9 });
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe2d4b7, roughness: 0.8 });
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    const roadMarkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.7 });
    const bldgWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const bldgGreenMat = new THREE.MeshStandardMaterial({ color: 0x225544, roughness: 0.5 });
    const bldgAccentMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.6,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
    windowMaterialsRef.current.push(windowMat);

    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
    const pitchLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const foliageDark = new THREE.MeshStandardMaterial({ color: 0x245135, roughness: 0.9, flatShading: true });
    const foliageLight = new THREE.MeshStandardMaterial({ color: 0x3f7d49, roughness: 0.9, flatShading: true });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });

    // 1. Water Plane (Surrounding ocean bay)
    const waterGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x64b5f6,
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -0.4;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 2. Main Campus Island Base (Lush polygonal landform)
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Sand rim / beach
    const sandGeo = new THREE.CylinderGeometry(23.5, 24.5, 0.7, 40);
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.position.y = -0.25;
    sandMesh.receiveShadow = true;
    islandGroup.add(sandMesh);

    // Green Island top plate
    const islandGeo = new THREE.CylinderGeometry(22, 23.2, 0.6, 40);
    const islandMesh = new THREE.Mesh(islandGeo, groundMat);
    islandMesh.position.y = 0.1;
    islandMesh.receiveShadow = true;
    islandGroup.add(islandMesh);

    // Stone pier / marina on the side
    const pierGeo = new THREE.BoxGeometry(4, 0.4, 10);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const pierMesh = new THREE.Mesh(pierGeo, pierMat);
    pierMesh.position.set(16, 0, 12);
    pierMesh.receiveShadow = true;
    islandGroup.add(pierMesh);

    // 3. Roads & Streets Network (Enclosing the campus blocks)
    const roadGroup = new THREE.Group();
    islandGroup.add(roadGroup);

    // Loop road
    const addRoadSegment = (w: number, d: number, x: number, z: number) => {
      const road = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), asphaltMat);
      road.position.set(x, 0.28, z);
      road.receiveShadow = true;
      roadGroup.add(road);

      // Curbs
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(w > d ? w : 0.2, 0.1, w > d ? 0.2 : d), curbMat);
      curbL.position.set(x + (w > d ? 0 : w / 2), 0.32, z + (w > d ? d / 2 : 0));
      roadGroup.add(curbL);
    };

    // Main ring avenue
    addRoadSegment(26, 3.2, 0, 9); // South road
    addRoadSegment(26, 3.2, 0, -11); // North road
    addRoadSegment(3.2, 22, -11, -1); // West road
    addRoadSegment(3.2, 22, 11, -1); // East road

    // Road dashes
    for (let x = -10; x <= 10; x += 3) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.2), roadMarkMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.32, 9);
      roadGroup.add(dash);

      const dashN = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.2), roadMarkMat);
      dashN.rotation.x = -Math.PI / 2;
      dashN.position.set(x, 0.32, -11);
      roadGroup.add(dashN);
    }
    for (let z = -9; z <= 7; z += 3) {
      const dashW = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1.4), roadMarkMat);
      dashW.rotation.x = -Math.PI / 2;
      dashW.position.set(-11, 0.32, z);
      roadGroup.add(dashW);

      const dashE = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1.4), roadMarkMat);
      dashE.rotation.x = -Math.PI / 2;
      dashE.position.set(11, 0.32, z);
      roadGroup.add(dashE);
    }

    // Pedestrian crosswalks
    [-9.5, 0, 9.5].forEach((cx) => {
      for (let i = -1.2; i <= 1.2; i += 0.5) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2.4), roadMarkMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(cx, 0.32, 9 + i);
        stripe.rotation.z = Math.PI / 2;
        roadGroup.add(stripe);
      }
    });

    // 4. THE FOOTBALL / SOCCER GROUND (Central courtyard landmark)
    const pitchGroup = new THREE.Group();
    pitchGroup.position.set(0, 0.28, 2.5);
    islandGroup.add(pitchGroup);

    // Turf base
    const pitchMesh = new THREE.Mesh(new THREE.BoxGeometry(11, 0.08, 7.5), pitchMat);
    pitchMesh.receiveShadow = true;
    pitchGroup.add(pitchMesh);

    // Mowing pattern alternating stripes
    for (let s = -4.5; s <= 4.5; s += 1.8) {
      const stripeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 7.2),
        new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.9 })
      );
      stripeMesh.rotation.x = -Math.PI / 2;
      stripeMesh.position.set(s, 0.05, 0);
      pitchGroup.add(stripeMesh);
    }

    // Outer white border line
    const addLine = (w: number, d: number, x: number, z: number) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(w, d), pitchLineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.055, z);
      pitchGroup.add(line);
    };
    addLine(10, 0.08, 0, 3.4);
    addLine(10, 0.08, 0, -3.4);
    addLine(0.08, 6.8, -5, 0);
    addLine(0.08, 6.8, 5, 0);
    // Center line & circle
    addLine(0.08, 6.8, 0, 0);
    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.18, 32), pitchLineMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.055, 0);
    pitchGroup.add(centerCircle);

    // Penalty boxes
    addLine(1.6, 0.08, -4.2, 1.8);
    addLine(1.6, 0.08, -4.2, -1.8);
    addLine(0.08, 3.6, -3.4, 0);

    addLine(1.6, 0.08, 4.2, 1.8);
    addLine(1.6, 0.08, 4.2, -1.8);
    addLine(0.08, 3.6, 3.4, 0);

    // Goalposts (White frames)
    const createGoal = (posX: number, rotY: number) => {
      const goal = new THREE.Group();
      const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), goalMat);
      postL.position.set(0, 0.45, 0.9);
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), goalMat);
      postR.position.set(0, 0.45, -0.9);
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), goalMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(0, 0.9, 0);

      // Net back
      const netMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      });
      const net = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 1.8), netMat);
      net.position.set(posX > 0 ? 0.25 : -0.25, 0.45, 0);

      goal.add(postL, postR, crossbar, net);
      goal.position.set(posX, 0, 0);
      goal.rotation.y = rotY;
      return goal;
    };
    pitchGroup.add(createGoal(-5, 0));
    pitchGroup.add(createGoal(5, Math.PI));

    // Interactive Soccer Ball
    const ballGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const soccerBall = new THREE.Mesh(ballGeo, ballMat);
    soccerBall.position.set(0, 0.22, 0);
    soccerBall.castShadow = true;
    pitchGroup.add(soccerBall);
    soccerBallRef.current = soccerBall;

    // Corner flags
    const createCornerFlag = (fx: number, fz: number) => {
      const flagGroup = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      pole.position.y = 0.3;
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.15), new THREE.MeshBasicMaterial({ color: 0xe11d48, side: THREE.DoubleSide }));
      cloth.position.set(0.1, 0.5, 0);
      flagGroup.add(pole, cloth);
      flagGroup.position.set(fx, 0, fz);
      return flagGroup;
    };
    pitchGroup.add(createCornerFlag(-5, -3.4));
    pitchGroup.add(createCornerFlag(-5, 3.4));
    pitchGroup.add(createCornerFlag(5, -3.4));
    pitchGroup.add(createCornerFlag(5, 3.4));

    // 4 Corner Floodlights for football ground
    [-5.6, 5.6].forEach((flx) => {
      [-4.0, 4.0].forEach((flz) => {
        const floodlightGroup = new THREE.Group();
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.8), curbMat);
        mast.position.y = 1.9;
        mast.castShadow = true;

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.6), bldgAccentMat);
        head.position.set(0, 3.8, 0);
        head.lookAt(0, 0, 0);

        const spot = new THREE.PointLight(0xfff7ed, 0, 16);
        spot.position.set(0, 3.8, 0);
        streetLightsRef.current.push(spot);

        floodlightGroup.add(mast, head, spot);
        floodlightGroup.position.set(flx, 0, flz);
        pitchGroup.add(floodlightGroup);
      });
    });

    // 5. BUILDINGS (Detailed Architecture matching the video)

    // Helper: Window rows generator
    const addWindows = (building: THREE.Group, w: number, h: number, d: number, floors: number) => {
      const floorH = h / floors;
      for (let f = 0; f < floors; f++) {
        const y = 0.5 + f * floorH;
        // Front & Back
        const winF = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, floorH * 0.45), windowMat);
        winF.position.set(0, y, d / 2 + 0.02);
        const winB = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, floorH * 0.45), windowMat);
        winB.rotation.y = Math.PI;
        winB.position.set(0, y, -d / 2 - 0.02);
        building.add(winF, winB);

        // Sides
        const winR = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.75, floorH * 0.45), windowMat);
        winR.rotation.y = Math.PI / 2;
        winR.position.set(w / 2 + 0.02, y, 0);
        const winL = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.75, floorH * 0.45), windowMat);
        winL.rotation.y = -Math.PI / 2;
        winL.position.set(-w / 2 - 0.02, y, 0);
        building.add(winR, winL);
      }
    };

    // Helper: Rooftop AC units & details
    const addRooftopProps = (group: THREE.Group, roofY: number, size: number) => {
      // AC Unit box
      const ac = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), curbMat);
      ac.position.set(size * 0.2, roofY + 0.2, size * 0.15);
      ac.castShadow = true;
      group.add(ac);

      // Solar panels
      for (let i = -1; i <= 1; i++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.05, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.8 })
        );
        panel.rotation.x = 0.2;
        panel.position.set(i * 0.9, roofY + 0.1, -size * 0.2);
        panel.castShadow = true;
        group.add(panel);
      }
    };

    // --- BUILDING 1: Headquarters (Boss Cabin penthouse + Reception ground atrium) ---
    const hqGroup = new THREE.Group();
    hqGroup.position.set(-4, 0.28, -3);
    islandGroup.add(hqGroup);

    // Podium (Reception Atrium)
    const hqPodium = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 4.4), bldgWhiteMat);
    hqPodium.position.y = 1.2;
    hqPodium.castShadow = true;
    hqPodium.receiveShadow = true;
    hqGroup.add(hqPodium);
    addWindows(hqGroup, 5.2, 2.4, 4.4, 2);

    // Green modern canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.2), bldgGreenMat);
    canopy.position.set(0, 1.4, 2.6);
    hqGroup.add(canopy);

    // Upper Tower (Boss Cabin Penthouse)
    const hqTower = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.6, 3.4), bldgGreenMat);
    hqTower.position.y = 2.4 + 1.8;
    hqTower.castShadow = true;
    hqTower.receiveShadow = true;
    hqGroup.add(hqTower);
    addWindows(hqGroup, 4.0, 3.6, 3.4, 3);

    // Penthouse glass cube (Boss Cabin)
    const bossPenthouse = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.4, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.4 })
    );
    bossPenthouse.position.y = 6.0 + 0.7;
    bossPenthouse.castShadow = true;
    hqGroup.add(bossPenthouse);
    addRooftopProps(hqGroup, 6.7, 3);

    // Helipad / Rooftop terrace markings on penthouse top
    const helipad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    );
    helipad.position.set(0, 7.42, 0);
    hqGroup.add(helipad);

    // --- BUILDING 2: Engineering & Design Hub (Work Studio & Design Room) ---
    const studioGroup = new THREE.Group();
    studioGroup.position.set(7, 0.28, -5);
    islandGroup.add(studioGroup);

    // Studio base & floors
    const studioBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.8, 7.2), bldgWhiteMat);
    studioBody.position.y = 2.4;
    studioBody.castShadow = true;
    studioBody.receiveShadow = true;
    studioGroup.add(studioBody);
    addWindows(studioGroup, 4.8, 4.8, 7.2, 4);

    // Architectural wooden/green vertical louvers
    for (let l = -3.0; l <= 3.0; l += 0.8) {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 0.25), bldgGreenMat);
      louver.position.set(2.45, 2.4, l);
      studioGroup.add(louver);
    }
    addRooftopProps(studioGroup, 4.8, 4.5);

    // --- BUILDING 3: Mission Operations Center (DevOps & Server Infrastructure) ---
    const opsGroup = new THREE.Group();
    opsGroup.position.set(-8, 0.28, 2);
    islandGroup.add(opsGroup);

    const opsBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 4.2), bldgAccentMat);
    opsBody.position.y = 1.7;
    opsBody.castShadow = true;
    opsBody.receiveShadow = true;
    opsGroup.add(opsBody);
    addWindows(opsGroup, 3.6, 3.4, 4.2, 2);

    // Server antenna tower & Satellite dish
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 2.8), curbMat);
    antenna.position.set(0.8, 4.8, 0.8);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI), curbMat);
    dish.rotation.x = -Math.PI / 4;
    dish.position.set(-0.8, 3.9, -0.6);
    opsGroup.add(antenna, dish);

    // --- BUILDING 4: Glass Boardroom / Meeting Cube ---
    const meetingGroup = new THREE.Group();
    meetingGroup.position.set(-7, 0.28, -7);
    islandGroup.add(meetingGroup);

    // Cantilever pillar base
    const pillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.5), curbMat);
    pillar1.position.set(1.2, 1.25, 1.2);
    const pillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.5), curbMat);
    pillar2.position.set(-1.2, 1.25, -1.2);
    meetingGroup.add(pillar1, pillar2);

    // Elevated Glass boardroom box
    const boardroom = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 2.6, 3.8),
      new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.75,
      })
    );
    boardroom.position.y = 3.6;
    boardroom.castShadow = true;
    meetingGroup.add(boardroom);

    // Boardroom interior table visible through glass
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.0), trunkMat);
    table.position.set(0, 3.1, 0);
    meetingGroup.add(table);

    // --- BUILDING 5: The Rooftop Lounge & Cafeteria ---
    const loungeGroup = new THREE.Group();
    loungeGroup.position.set(0, 0.28, -8);
    islandGroup.add(loungeGroup);

    const loungeBase = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.2, 3.6), bldgGreenMat);
    loungeBase.position.y = 1.6;
    loungeBase.castShadow = true;
    loungeBase.receiveShadow = true;
    loungeGroup.add(loungeBase);
    addWindows(loungeGroup, 5.4, 3.2, 3.6, 2);

    // Rooftop pergola & sun umbrellas
    const pergola = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 2.4), trunkMat);
    pergola.position.set(0, 4.4, 0);
    loungeGroup.add(pergola);
    [-1.6, 1.6].forEach((px) => {
      [-1.0, 1.0].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2), trunkMat);
        post.position.set(px, 3.8, pz);
        loungeGroup.add(post);
      });
    });

    // 6. PARK, TREES & FOUNTAIN (Lush nature around campus)

    // Central Plazas & Fountain
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0.35, -2.5);
    islandGroup.add(fountainGroup);

    const pool = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 0.3, 24),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 })
    );
    pool.receiveShadow = true;
    const poolWater = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.25, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.5 })
    );
    fountainGroup.add(pool, poolWater);

    // Fountain particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 0.4;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.1, transparent: true, opacity: 0.8 });
    const fountainParticles = new THREE.Points(particleGeo, particleMat);
    fountainGroup.add(fountainParticles);
    fountainParticlesRef.current = fountainParticles;

    // Helper: Create low-poly stylized tree
    const createTree = (x: number, z: number, scale = 1, isPine = false) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale, 8), trunkMat);
      trunk.position.y = (0.6 * scale);
      trunk.castShadow = true;
      tree.add(trunk);

      if (isPine) {
        // Stacked cones
        [1.2, 1.7, 2.1].forEach((py, idx) => {
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry((0.9 - idx * 0.2) * scale, 0.8 * scale, 7),
            foliageDark
          );
          cone.position.y = py * scale;
          cone.castShadow = true;
          tree.add(cone);
        });
      } else {
        // Rounded stylized puff
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.85 * scale, 1),
          Math.random() > 0.5 ? foliageLight : foliageDark
        );
        puff.position.y = 1.5 * scale;
        puff.castShadow = true;
        tree.add(puff);
      }
      tree.position.set(x, 0.28, z);
      return tree;
    };

    // Plant trees throughout campus walkways
    const treeCoords: [number, number, number, boolean][] = [
      [-9, -3, 1.1, true],
      [-9, -1, 0.9, false],
      [-9, 6, 1.0, false],
      [-2, 6.5, 0.9, true],
      [2, 6.5, 1.0, false],
      [9, 6.5, 1.2, true],
      [9, 3, 0.9, false],
      [9, -9, 1.1, true],
      [4, -8, 0.8, false],
      [-4, -8, 0.9, true],
      [-14, 0, 1.3, false],
      [14, 0, 1.1, true],
      [14, -6, 1.2, false],
      [14, 5, 1.0, true],
      [-14, 5, 0.9, true],
      [-14, -5, 1.0, false],
    ];
    treeCoords.forEach(([tx, tz, sc, pine]) => {
      islandGroup.add(createTree(tx, tz, sc, pine));
    });

    // Park benches
    const addBench = (bx: number, bz: number, rotY: number) => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.3), trunkMat);
      seat.position.y = 0.2;
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), curbMat);
      legs.position.y = 0.1;
      bench.add(seat, legs);
      bench.position.set(bx, 0.28, bz);
      bench.rotation.y = rotY;
      islandGroup.add(bench);
    };
    addBench(-2.5, 1.5, Math.PI / 2);
    addBench(2.5, 1.5, -Math.PI / 2);
    addBench(0, -4.5, 0);

    // Street Lamps with real lighting point lights
    const lampCoords = [
      [-11, 7],
      [-11, -7],
      [11, 7],
      [11, -7],
      [0, 10.5],
      [0, -9.5],
    ];
    lampCoords.forEach(([lx, lz]) => {
      const lamp = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.2), bldgAccentMat);
      pole.position.y = 1.1;
      pole.castShadow = true;
      const lightBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lightBulb.position.y = 2.2;

      const pLight = new THREE.PointLight(0xfff1aa, 0, 8);
      pLight.position.y = 2.2;
      streetLightsRef.current.push(pLight);

      lamp.add(pole, lightBulb, pLight);
      lamp.position.set(lx, 0.28, lz);
      islandGroup.add(lamp);
    });

    // 7. ANIMATED 3D CARS ON ROADS
    const createCar = (color: number) => {
      const car = new THREE.Group();
      const carMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 });
      const glassM = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 });

      // Lower body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.38, 0.75), carMat);
      body.position.y = 0.25;
      body.castShadow = true;

      // Cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 0.65), glassM);
      cabin.position.set(-0.1, 0.54, 0);
      cabin.castShadow = true;

      // Wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      [-0.45, 0.45].forEach((wx) => {
        [-0.38, 0.38].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), wheelMat);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(wx, 0.14, wz);
          car.add(wheel);
        });
      });

      car.add(body, cabin);
      return car;
    };

    // Add 4 moving cars with circular/oval routes
    const car1 = createCar(0xef4444); // Red sports car
    islandGroup.add(car1);
    carsRef.current.push({ mesh: car1, speed: 0.008, angle: 0, radius: 10, centerX: 0, centerZ: -1 });

    const car2 = createCar(0x0284c7); // Cyan sedan
    islandGroup.add(car2);
    carsRef.current.push({ mesh: car2, speed: 0.006, angle: Math.PI / 2, radius: 10, centerX: 0, centerZ: -1 });

    const car3 = createCar(0xf59e0b); // Yellow taxi
    islandGroup.add(car3);
    carsRef.current.push({ mesh: car3, speed: 0.007, angle: Math.PI, radius: 10, centerX: 0, centerZ: -1 });

    // Parked cars in parking bay
    const parked1 = createCar(0xffffff);
    parked1.position.set(6, 0.28, 7);
    parked1.rotation.y = Math.PI / 2;
    islandGroup.add(parked1);

    const parked2 = createCar(0x10b981);
    parked2.position.set(4, 0.28, 7);
    parked2.rotation.y = Math.PI / 2;
    islandGroup.add(parked2);

    // 8. CAMPUS PEOPLE & CHARACTERS (Realistic Anatomical Humans)
    const peopleGroup = new THREE.Group();
    islandGroup.add(peopleGroup);
    charactersRef.current = [];

    const createCharacter = (profile: PersonProfile): CharacterInstance => {
      const charGroup = new THREE.Group();
      charGroup.position.set(...profile.position);
      if (profile.rotationY !== undefined) {
        charGroup.rotation.y = profile.rotationY;
      }

      // Realistic PBR materials (Skin, Cloth, Shoes)
      const skinMat = new THREE.MeshStandardMaterial({
        color: profile.skinColor,
        roughness: 0.52,
        metalness: 0.04,
      });

      const shirtMat = new THREE.MeshStandardMaterial({
        color: profile.shirtColor,
        roughness: 0.82,
        metalness: 0.02,
      });

      const pantsMat = new THREE.MeshStandardMaterial({
        color: profile.pantsColor,
        roughness: 0.78,
      });

      const hairMat = new THREE.MeshStandardMaterial({
        color: profile.hairColor,
        roughness: 0.65,
        metalness: 0.1,
      });

      const shoeUpperMat = new THREE.MeshStandardMaterial({
        color: profile.category === 'footballer' ? profile.shirtColor : 0x1e293b,
        roughness: 0.7,
      });

      const shoeSoleMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.4,
      });

      // --- LOWER BODY & HIPS ---
      const pelvis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.095, 0.10, 12),
        pantsMat
      );
      pelvis.position.y = 0.40;
      pelvis.castShadow = true;
      charGroup.add(pelvis);

      // Belt with metal buckle
      const belt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.108, 0.108, 0.025, 12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
      );
      belt.position.y = 0.44;
      charGroup.add(belt);

      const buckle = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.022, 0.015),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
      );
      buckle.position.set(0, 0.44, 0.105);
      charGroup.add(buckle);

      // Helper: Anatomical Leg with Thigh, Knee joint, Shin, and Contoured Sneaker
      const createAnatomicalLeg = (isLeft: boolean) => {
        const hipGroup = new THREE.Group();
        hipGroup.position.set(isLeft ? -0.065 : 0.065, 0.38, 0);

        // Upper Thigh
        const thigh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.044, 0.036, 0.18, 10),
          pantsMat
        );
        thigh.position.y = -0.09;
        thigh.castShadow = true;
        hipGroup.add(thigh);

        // Knee Joint
        const kneeGroup = new THREE.Group();
        kneeGroup.position.set(0, -0.18, 0);

        // Shin / Calf
        const isShorts = profile.category === 'footballer';
        const shin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.036, 0.028, 0.18, 10),
          isShorts ? skinMat : pantsMat
        );
        shin.position.y = -0.09;
        shin.castShadow = true;
        kneeGroup.add(shin);

        // Football socks for footballers
        if (isShorts) {
          const sock = new THREE.Mesh(
            new THREE.CylinderGeometry(0.034, 0.029, 0.12, 10),
            shirtMat
          );
          sock.position.y = -0.11;
          kneeGroup.add(sock);
        }

        // Realistic Sneaker / Cleat
        const shoeGroup = new THREE.Group();
        shoeGroup.position.set(0, -0.18, 0.02);

        // White rubber sole
        const sole = new THREE.Mesh(
          new THREE.BoxGeometry(0.065, 0.022, 0.13),
          shoeSoleMat
        );
        sole.position.y = -0.01;
        sole.castShadow = true;

        // Contoured shoe upper
        const upper = new THREE.Mesh(
          new THREE.BoxGeometry(0.062, 0.04, 0.12),
          shoeUpperMat
        );
        upper.position.set(0, 0.015, 0.01);
        upper.castShadow = true;

        shoeGroup.add(sole, upper);
        kneeGroup.add(shoeGroup);
        hipGroup.add(kneeGroup);

        return { hipGroup, kneeGroup };
      };

      const leftLegData = createAnatomicalLeg(true);
      const rightLegData = createAnatomicalLeg(false);

      if (profile.isSitting) {
        leftLegData.hipGroup.rotation.x = -Math.PI / 2.1;
        rightLegData.hipGroup.rotation.x = -Math.PI / 2.1;
        leftLegData.kneeGroup.rotation.x = Math.PI / 2.1;
        rightLegData.kneeGroup.rotation.x = Math.PI / 2.1;
        pelvis.position.y = 0.28;
      }

      charGroup.add(leftLegData.hipGroup, rightLegData.hipGroup);

      // --- SPINE & UPPER BODY ---
      const spine = new THREE.Group();
      spine.position.y = 0.44;
      charGroup.add(spine);

      // Broad athletic chest tapering to waist
      const chest = new THREE.Mesh(
        new THREE.CylinderGeometry(0.125, 0.098, 0.22, 12),
        shirtMat
      );
      chest.position.y = 0.11;
      chest.castShadow = true;
      spine.add(chest);

      // Shirt Collar / V-neck detail
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.042, 0.01, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0.22, 0.02);
      spine.add(collar);

      // Footballer squad number badge on front & back
      if (profile.category === 'footballer' && profile.team !== 'referee') {
        const badge = new THREE.Mesh(
          new THREE.PlaneGeometry(0.05, 0.05),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        badge.position.set(0, 0.14, 0.102);
        spine.add(badge);

        const badgeBack = new THREE.Mesh(
          new THREE.PlaneGeometry(0.08, 0.08),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        badgeBack.rotation.y = Math.PI;
        badgeBack.position.set(0, 0.14, -0.102);
        spine.add(badgeBack);
      }

      // Referee black & white stripes
      if (profile.team === 'referee') {
        for (let s = -0.08; s <= 0.08; s += 0.04) {
          const stripe = new THREE.Mesh(
            new THREE.PlaneGeometry(0.02, 0.20),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          stripe.position.set(s, 0.11, 0.102);
          spine.add(stripe);
        }
      }

      // --- NECK & REALISTIC SCULPTED HEAD ---
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.040, 0.06, 12),
        skinMat
      );
      neck.position.y = 0.24;
      spine.add(neck);

      const headGroup = new THREE.Group();
      headGroup.position.y = 0.32;
      spine.add(headGroup);

      // Smooth Cranium with natural human egg-oval shape
      const cranium = new THREE.Mesh(
        new THREE.SphereGeometry(0.076, 16, 16),
        skinMat
      );
      cranium.scale.set(0.92, 1.15, 1.05);
      cranium.castShadow = true;
      headGroup.add(cranium);

      // Sculpted layered hair (Organically wraps skull)
      const hairGroup = new THREE.Group();
      const hairTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.080, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7),
        hairMat
      );
      hairTop.scale.set(0.95, 1.18, 1.08);
      hairTop.position.set(0, 0.015, -0.005);
      hairTop.castShadow = true;
      hairGroup.add(hairTop);

      // Hair sideburns & back taper
      const hairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.05),
        hairMat
      );
      hairBack.position.set(0, 0.01, -0.06);
      hairGroup.add(hairBack);
      headGroup.add(hairGroup);

      // Subtle stylish glasses / sunglasses for select characters
      if (profile.id === 'boss_executive' || profile.id === 'fountain_reader') {
        const glasses = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.024, 0.03),
          new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.9 })
        );
        glasses.position.set(0, 0.015, 0.075);
        headGroup.add(glasses);
      }

      // --- ANATOMICAL MULTI-SEGMENT ARMS ---
      const createAnatomicalArm = (isLeft: boolean) => {
        const shoulderGroup = new THREE.Group();
        shoulderGroup.position.set(isLeft ? -0.155 : 0.155, 0.20, 0);

        // Shoulder Deltoid Cap
        const deltoid = new THREE.Mesh(
          new THREE.SphereGeometry(0.038, 10, 10),
          shirtMat
        );
        shoulderGroup.add(deltoid);

        // Upper Bicep / Tricep
        const upperArm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.034, 0.028, 0.14, 10),
          shirtMat
        );
        upperArm.position.y = -0.07;
        upperArm.castShadow = true;
        shoulderGroup.add(upperArm);

        // Elbow Joint
        const elbowGroup = new THREE.Group();
        elbowGroup.position.set(0, -0.14, 0);

        // Forearm
        const forearm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.028, 0.023, 0.13, 10),
          skinMat
        );
        forearm.position.y = -0.065;
        forearm.castShadow = true;
        elbowGroup.add(forearm);

        // Natural Hand (Palm + Thumb contour)
        const hand = new THREE.Mesh(
          new THREE.SphereGeometry(0.024, 8, 8),
          skinMat
        );
        hand.scale.set(0.8, 1.2, 0.9);
        hand.position.set(0, -0.14, 0.01);
        elbowGroup.add(hand);

        // Default natural slight elbow resting flexion (~15 deg)
        elbowGroup.rotation.x = 0.25;

        shoulderGroup.add(elbowGroup);
        return { shoulderGroup, elbowGroup };
      };

      const leftArmData = createAnatomicalArm(true);
      const rightArmData = createAnatomicalArm(false);
      spine.add(leftArmData.shoulderGroup, rightArmData.shoulderGroup);

      // --- ACCESSORIES (Realistic Laptop, Coffee Mug) ---
      if (profile.id === 'spectator_1' || profile.id === 'fountain_reader') {
        const laptop = new THREE.Group();
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.015, 0.11),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
        );
        const screen = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.10, 0.01),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
        );
        screen.position.set(0, 0.05, -0.05);
        screen.rotation.x = -0.2;
        laptop.add(base, screen);
        laptop.position.set(0, 0.32, 0.13);
        charGroup.add(laptop);
      } else if (profile.id === 'walker_south' || profile.id === 'lounge_barista') {
        const mug = new THREE.Mesh(
          new THREE.CylinderGeometry(0.028, 0.022, 0.065, 10),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
        );
        mug.position.set(0, -0.17, 0.03);
        rightArmData.elbowGroup.add(mug);
      }

      peopleGroup.add(charGroup);

      return {
        profile,
        group: charGroup,
        spine,
        leftLegHip: leftLegData.hipGroup,
        leftKnee: leftLegData.kneeGroup,
        rightLegHip: rightLegData.hipGroup,
        rightKnee: rightLegData.kneeGroup,
        leftArmShoulder: leftArmData.shoulderGroup,
        leftElbow: leftArmData.elbowGroup,
        rightArmShoulder: rightArmData.shoulderGroup,
        rightElbow: rightArmData.elbowGroup,
        head: headGroup,
        walkPhase: Math.random() * Math.PI * 2,
        walkSpeed: 0.026,
        walkTargetIdx: 0,
        currentPos: new THREE.Vector3(...profile.position),
        basePos: new THREE.Vector3(...profile.position),
        cheerTime: 0,
      };
    };

    CAMPUS_PEOPLE.forEach((p) => {
      charactersRef.current.push(createCharacter(p));
    });

    // 9. DISTANT ENVIRONMENT: LIGHTHOUSE & SAILBOATS
    const lighthouseGroup = new THREE.Group();
    lighthouseGroup.position.set(20, 0, -22);
    scene.add(lighthouseGroup);

    // Rocky islet
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(3.5, 1),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
    );
    rock.position.y = 0.5;
    rock.scale.set(1.5, 0.4, 1.2);
    lighthouseGroup.add(rock);

    // White & Red striped lighthouse tower
    const lhBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 5.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    );
    lhBase.position.y = 3.6;
    lhBase.castShadow = true;
    lighthouseGroup.add(lhBase);

    // Red bands
    [2.2, 4.2].forEach((ry) => {
      const redBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 1.05, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xdc2626 })
      );
      redBand.position.y = ry;
      lighthouseGroup.add(redBand);
    });

    // Lantern room & Spotlight beam
    const lantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1 })
    );
    lantern.position.y = 6.6;
    lighthouseGroup.add(lantern);

    // Sweeping cone beam
    const beamGeo = new THREE.ConeGeometry(3.5, 24, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, 6.6, 12);
    lighthouseGroup.add(beam);
    lighthouseBeamRef.current = beam;
    beam.visible = false; // toggled on at sunset/night

    // Sailboats floating on water
    const createSailboat = (sx: number, sz: number, rotY: number) => {
      const boat = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      const sailGeo = new THREE.BufferGeometry();
      const verts = new Float32Array([
        0, 0.3, 0,
        0, 1.8, 0,
        0.8, 0.3, 0,
      ]);
      sailGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const sailMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
      const sailMesh = new THREE.Mesh(sailGeo, sailMat);
      boat.add(hull, sailMesh);
      boat.position.set(sx, -0.2, sz);
      boat.rotation.y = rotY;
      return boat;
    };
    scene.add(createSailboat(-18, 16, 0.6));
    scene.add(createSailboat(18, -14, -1.2));
    scene.add(createSailboat(-22, -10, 2.1));

    // Mouse Controls (Rotate / Pan)
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragButton.current = e.button;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };

      if (dragButton.current === 0) {
        // Left button: Orbit rotation
        orbitSpherical.current.theta -= deltaX * 0.005;
        orbitSpherical.current.phi -= deltaY * 0.005;
        // Limit phi to avoid flipping upside down or going beneath ground
        orbitSpherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2.15, orbitSpherical.current.phi));

        const offset = new THREE.Vector3().setFromSpherical(orbitSpherical.current);
        targetCamPos.current.copy(targetLookAt.current).add(offset);
      } else if (dragButton.current === 2) {
        // Right button: Pan
        const cam = cameraRef.current;
        if (!cam) return;
        const panSpeed = 0.03;
        const right = new THREE.Vector3().crossVectors(cam.up, cam.getWorldDirection(new THREE.Vector3())).normalize();
        const up = new THREE.Vector3(0, 1, 0);

        const panDelta = right.clone().multiplyScalar(deltaX * panSpeed).add(up.clone().multiplyScalar(-deltaY * panSpeed));
        targetLookAt.current.add(panDelta);
        targetCamPos.current.add(panDelta);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.03;
      orbitSpherical.current.radius = Math.max(8, Math.min(65, orbitSpherical.current.radius + zoomFactor));
      const offset = new THREE.Vector3().setFromSpherical(orbitSpherical.current);
      targetCamPos.current.copy(targetLookAt.current).add(offset);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent context menu on right drag
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', handleContextMenu);

    // Touch support for mobile / gestures
    let touchStartDist = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        dragButton.current = 0;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        orbitSpherical.current.theta -= deltaX * 0.007;
        orbitSpherical.current.phi -= deltaY * 0.007;
        orbitSpherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2.15, orbitSpherical.current.phi));

        const offset = new THREE.Vector3().setFromSpherical(orbitSpherical.current);
        targetCamPos.current.copy(targetLookAt.current).add(offset);
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = touchStartDist - dist;
        touchStartDist = dist;
        orbitSpherical.current.radius = Math.max(8, Math.min(65, orbitSpherical.current.radius + delta * 0.05));
        const offset = new THREE.Vector3().setFromSpherical(orbitSpherical.current);
        targetCamPos.current.copy(targetLookAt.current).add(offset);
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    dom.addEventListener('touchstart', handleTouchStart);
    dom.addEventListener('touchmove', handleTouchMove);
    dom.addEventListener('touchend', handleTouchEnd);

    // Resize observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth camera interpolation (lerp)
      currentCamPos.current.lerp(targetCamPos.current, 0.08);
      currentLookAt.current.lerp(targetLookAt.current, 0.08);
      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);

      // Water animation
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = -0.4 + Math.sin(elapsed * 1.5) * 0.04;
      }

      // Lighthouse beam rotation
      if (lighthouseBeamRef.current && lighthouseBeamRef.current.visible) {
        lighthouseBeamRef.current.rotation.z += 0.015;
      }

      // Fountain spray particles
      if (fountainParticlesRef.current) {
        const posAttr = fountainParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
          let y = posAttr.getY(i) + 0.02;
          if (y > 1.2) {
            y = 0.2;
          }
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }

      // Moving cars update
      carsRef.current.forEach((car) => {
        car.angle += car.speed;
        const x = car.centerX + Math.cos(car.angle) * car.radius;
        const z = car.centerZ + Math.sin(car.angle) * car.radius;
        car.mesh.position.set(x, 0.28, z);
        car.mesh.rotation.y = -car.angle;
      });

      // Ball kick physics
      if (soccerBallRef.current && ballVelocityRef.current.lengthSq() > 0.001) {
        soccerBallRef.current.position.addScaledVector(ballVelocityRef.current, 0.016);
        ballVelocityRef.current.multiplyScalar(0.97); // friction
        ballVelocityRef.current.y -= 9.8 * 0.016; // gravity
        if (soccerBallRef.current.position.y < 0.22) {
          soccerBallRef.current.position.y = 0.22;
          ballVelocityRef.current.y = -ballVelocityRef.current.y * 0.6; // bounce
        }
      }

      // Characters animation update (Realistic Multi-Joint Kinematics)
      const ballPos = soccerBallRef.current ? soccerBallRef.current.position : new THREE.Vector3(0, 0.22, 2.5);

      charactersRef.current.forEach((char) => {
        // 1. Walking Pedestrians with Natural Human Gait
        if (char.profile.walkPath && char.profile.walkPath.length > 1) {
          char.walkPhase += 0.075;
          const target = char.profile.walkPath[char.walkTargetIdx];
          const targetVec = new THREE.Vector3(target[0], char.basePos.y, target[1]);
          const dir = targetVec.clone().sub(char.currentPos);
          const dist = dir.length();
          if (dist < 0.25) {
            char.walkTargetIdx = (char.walkTargetIdx + 1) % char.profile.walkPath.length;
          } else {
            dir.normalize();
            char.currentPos.addScaledVector(dir, char.walkSpeed);
            char.group.position.copy(char.currentPos);
            char.group.rotation.y = Math.atan2(dir.x, dir.z);

            // True anatomical human gait:
            const legPitch = Math.sin(char.walkPhase) * 0.52;
            char.leftLegHip.rotation.x = legPitch;
            char.rightLegHip.rotation.x = -legPitch;

            // Knee flexion (bends back on backswing, extends on plant)
            char.leftKnee.rotation.x = Math.max(0.08, -legPitch * 0.85);
            char.rightKnee.rotation.x = Math.max(0.08, legPitch * 0.85);

            // Arm swing opposite to legs with natural elbow flexion
            char.leftArmShoulder.rotation.x = -legPitch * 0.45;
            char.rightArmShoulder.rotation.x = legPitch * 0.45;
            char.leftElbow.rotation.x = 0.25 + Math.max(0, -legPitch * 0.25);
            char.rightElbow.rotation.x = 0.25 + Math.max(0, legPitch * 0.25);

            // Subtle pelvis weight shift and step bounce
            char.spine.rotation.z = Math.sin(char.walkPhase) * 0.03;
            char.spine.rotation.x = 0.04; // slight forward travel posture
            char.group.position.y = char.basePos.y + Math.abs(Math.sin(char.walkPhase * 2)) * 0.02;
          }
        } else if (char.profile.category === 'footballer') {
          // 2. Footballers: Athletic ready stances & dynamic match actions
          if (char.cheerTime > 0) {
            char.cheerTime -= 0.016;
            // Jumping and raising arms in genuine celebration
            char.leftArmShoulder.rotation.x = -2.5 + Math.sin(elapsed * 10) * 0.25;
            char.rightArmShoulder.rotation.x = -2.5 + Math.cos(elapsed * 10) * 0.25;
            char.leftElbow.rotation.x = 0.5;
            char.rightElbow.rotation.x = 0.5;
            char.leftKnee.rotation.x = 0.2;
            char.rightKnee.rotation.x = 0.2;
            char.group.position.y = char.basePos.y + Math.abs(Math.sin(elapsed * 9)) * 0.18;
          } else if (char.profile.team === 'red' || char.profile.team === 'blue') {
            if (char.profile.roleEn.includes('Goalkeeper')) {
              // Goalkeeper alert crouch: flexed knees, hands forward
              char.spine.rotation.x = 0.18;
              char.leftKnee.rotation.x = 0.35;
              char.rightKnee.rotation.x = 0.35;
              char.leftArmShoulder.rotation.x = -0.55;
              char.rightArmShoulder.rotation.x = -0.55;
              char.leftElbow.rotation.x = 0.65;
              char.rightElbow.rotation.x = 0.65;
              char.group.position.z = char.basePos.z + Math.sin(elapsed * 2.2) * 0.35;
            } else {
              // Outfield player athletic jogging & tracking ball
              char.walkPhase += 0.065;
              const jog = Math.sin(char.walkPhase) * 0.26;
              char.leftLegHip.rotation.x = jog;
              char.rightLegHip.rotation.x = -jog;
              char.leftKnee.rotation.x = Math.max(0.1, -jog * 0.5);
              char.rightKnee.rotation.x = Math.max(0.1, jog * 0.5);

              char.leftArmShoulder.rotation.x = -jog * 0.3;
              char.rightArmShoulder.rotation.x = jog * 0.3;
              char.leftElbow.rotation.x = 0.45;
              char.rightElbow.rotation.x = 0.45;
              char.spine.rotation.x = 0.12; // athletic forward lean

              // Turn torso towards the match ball
              const lookDir = ballPos.clone().sub(char.group.position);
              char.group.rotation.y = Math.atan2(lookDir.x, lookDir.z);
            }
          }
        } else if (char.profile.isSitting) {
          // 3. Sitting people on benches & lounges
          char.leftLegHip.rotation.x = -Math.PI / 2.1;
          char.rightLegHip.rotation.x = -Math.PI / 2.1;
          char.leftKnee.rotation.x = Math.PI / 2.1;
          char.rightKnee.rotation.x = Math.PI / 2.1;

          if (char.profile.id.startsWith('spectator')) {
            // Cheering fan with moving arms
            char.leftArmShoulder.rotation.x = -1.4 + Math.sin(elapsed * 5) * 0.35;
            char.rightArmShoulder.rotation.x = -1.4 + Math.cos(elapsed * 5) * 0.35;
            char.leftElbow.rotation.x = 0.5;
            char.rightElbow.rotation.x = 0.5;
          } else {
            // Peaceful seated reader
            char.head.rotation.y = Math.sin(elapsed * 0.7) * 0.18;
            char.leftArmShoulder.rotation.x = 0.2;
            char.rightArmShoulder.rotation.x = 0.2;
            char.leftElbow.rotation.x = 0.6;
            char.rightElbow.rotation.x = 0.6;
          }
        } else {
          // 4. Standing office workers: gentle breathing & natural head look
          char.spine.position.y = 0.44 + Math.sin(elapsed * 1.5) * 0.004;
          char.head.rotation.y = Math.sin(elapsed * 0.6) * 0.22;
          char.leftArmShoulder.rotation.x = Math.sin(elapsed * 0.5) * 0.05;
          char.rightArmShoulder.rotation.x = -Math.sin(elapsed * 0.5) * 0.05;
        }
      });

      // Render
      renderer.render(scene, camera);

      // Project 3D Pin anchors to 2D Screen space
      const newPins: ScreenPin[] = [];
      const camPos = camera.position;

      // Project "YOU" pin
      const youPos3D = pinAnchors.current.you.clone();
      // gentle bounce
      youPos3D.y += Math.sin(elapsed * 3) * 0.25;
      const youScreen = youPos3D.clone().project(camera);
      if (youScreen.z < 1) {
        const sx = ((youScreen.x + 1) * container.clientWidth) / 2;
        const sy = ((-youScreen.y + 1) * container.clientHeight) / 2;
        newPins.push({
          id: 'you',
          label: language === 'bn' ? 'আপনি (YOU)' : 'YOU',
          sublabel: language === 'bn' ? 'হেডকোয়ার্টার্স' : 'Headquarters',
          x: sx,
          y: sy,
          visible: true,
          color: '#0f172a',
          isYou: true,
        });
      }

      // Project room pins
      ROOMS.forEach((r) => {
        const anchor = pinAnchors.current[r.id];
        if (!anchor) return;
        const dist = camPos.distanceTo(anchor);
        // Only show room pins if not too far away
        const p3d = anchor.clone();
        const pScreen = p3d.project(camera);
        if (pScreen.z < 1) {
          const sx = ((pScreen.x + 1) * container.clientWidth) / 2;
          const sy = ((-pScreen.y + 1) * container.clientHeight) / 2;
          newPins.push({
            id: r.id,
            label: language === 'bn' ? r.code + ' ' + r.nameBn.split(' ')[0] : r.code + ' ' + r.nameEn,
            sublabel: language === 'bn' ? `${r.occupants} জন উপস্থিত` : `${r.occupants} active`,
            x: sx,
            y: sy,
            visible: dist < 55,
            color: r.color,
          });
        }
      });

      // Project Football Ground pin
      const fbPos = pinAnchors.current.football.clone().project(camera);
      if (fbPos.z < 1) {
        newPins.push({
          id: 'football',
          label: language === 'bn' ? '⚽ ফুটবল গ্রাউন্ড' : '⚽ Football Ground',
          sublabel: language === 'bn' ? 'ম্যাচ গ্রাউন্ড' : 'Campus Pitch',
          x: ((fbPos.x + 1) * container.clientWidth) / 2,
          y: ((-fbPos.y + 1) * container.clientHeight) / 2,
          visible: true,
          color: '#16a34a',
        });
      }

      setScreenPins(newPins);

      // Project people pins when camera is reasonably close or in football view
      const newPeoplePins: PersonPin[] = [];
      if (currentView === 'football' || camPos.distanceTo(new THREE.Vector3(0, 0, 0)) < 30) {
        charactersRef.current.forEach((char) => {
          const charHeadPos = char.group.position.clone();
          charHeadPos.y += 0.85;
          const pScreen = charHeadPos.project(camera);
          if (pScreen.z < 1) {
            const sx = ((pScreen.x + 1) * container.clientWidth) / 2;
            const sy = ((-pScreen.y + 1) * container.clientHeight) / 2;
            const dist = camPos.distanceTo(char.group.position);
            newPeoplePins.push({
              person: char.profile,
              x: sx,
              y: sy,
              visible: dist < 28,
            });
          }
        });
      }
      setScreenPeoplePins(newPeoplePins);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('contextmenu', handleContextMenu);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [language]);

  return (
    <div className="relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden">
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Screen Pins Projected into 3D Space */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {screenPins.map((pin) => {
          if (!pin.visible) return null;

          // The iconic "YOU" pin from the video: black badge pointing down with bouncy arrow
          if (pin.isYou) {
            return (
              <div
                key={pin.id}
                style={{
                  left: `${pin.x}px`,
                  top: `${pin.y}px`,
                  transform: 'translate(-50%, -100%)',
                }}
                className="absolute pointer-events-auto cursor-pointer group flex flex-col items-center animate-float-pin transition-transform duration-150"
                onClick={() => {
                  soundManager.playClick();
                  onSelectView('cabin');
                }}
              >
                <div className="bg-slate-900 text-white font-bold text-[11px] tracking-wider px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-slate-700/80 group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>{pin.label}</span>
                </div>
                {/* Arrow indicator */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900 group-hover:border-t-indigo-600 -mt-[1px]" />
              </div>
            );
          }

          // Regular room / landmark pins
          const isSelected = currentView === pin.id;

          return (
            <div
              key={pin.id}
              style={{
                left: `${pin.x}px`,
                top: `${pin.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute pointer-events-auto cursor-pointer group transition-all duration-200"
              onClick={() => {
                soundManager.playClick();
                if (pin.id === 'football') {
                  onSelectView('football');
                  kickBall();
                } else if (pin.id !== 'you' && pin.id !== 'lighthouse') {
                  onSelectView(pin.id);
                  if (onInspectRoom) onInspectRoom(pin.id);
                }
              }}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-900 text-white scale-110 ring-2 ring-white shadow-xl'
                    : 'bg-white/90 text-slate-800 hover:bg-slate-900 hover:text-white hover:scale-105 border border-white/60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pin.color }}
                />
                <span className="tracking-tight text-[11px] whitespace-nowrap">{pin.label}</span>
              </div>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] mx-auto -mt-[1px] border-t-slate-800/80" />
            </div>
          );
        })}

        {/* People Interactive Pins in 3D Space */}
        {screenPeoplePins.map((ppin) => {
          if (!ppin.visible) return null;
          const isPersonSelected = selectedPerson?.id === ppin.person.id;
          return (
            <div
              key={ppin.person.id}
              style={{
                left: `${ppin.x}px`,
                top: `${ppin.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute pointer-events-auto cursor-pointer group transition-all duration-200 z-15"
              onClick={() => {
                soundManager.playClick();
                if (onSelectPerson) {
                  onSelectPerson(isPersonSelected ? null : ppin.person);
                }
              }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md transition-all duration-150 ${
                  isPersonSelected
                    ? 'bg-amber-400 text-slate-950 scale-110 ring-2 ring-white shadow-xl'
                    : 'bg-slate-900/80 text-white hover:bg-slate-900 hover:scale-105 border border-white/20'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `#${ppin.person.shirtColor.toString(16).padStart(6, '0')}` }}
                />
                <span className="truncate max-w-[90px]">
                  {language === 'bn' ? ppin.person.nameBn.split(' ')[0] : ppin.person.nameEn.split(' ')[0]}
                </span>
              </div>
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] mx-auto -mt-[1px] border-t-slate-900/80" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
