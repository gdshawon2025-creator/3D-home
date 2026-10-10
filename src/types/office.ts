export type ViewMode = 
  | 'full'
  | 'football'
  | 'neighbourhood'
  | 'reception'
  | 'studio'
  | 'design'
  | 'meeting'
  | 'operations'
  | 'lounge'
  | 'cabin';

export type TimeOfDay = 'day' | 'sunset' | 'night';

export type Language = 'en' | 'bn';

export type CameraMode = 'orbit' | 'follow_boss' | 'interior';

export type BuildingTheme = 'emerald' | 'midnight' | 'minimal' | 'cyberpunk' | 'terracotta';

export type WeatherMode = 'sunny' | 'rain' | 'foggy';

export interface CampusConfig {
  buildingTheme: BuildingTheme;
  cameraMode: CameraMode;
  weather: WeatherMode;
  sunIntensity: number;
  ambientIntensity: number;
  trafficSpeed: number;
  cutawayRoofs: boolean;
  bossSpeed: number;
  activeInteriorRoom: ViewMode | null;
}

export interface RoomInfo {
  id: ViewMode;
  code: string;
  nameEn: string;
  nameBn: string;
  floorEn: string;
  floorBn: string;
  descriptionEn: string;
  descriptionBn: string;
  capacity: number;
  occupants: number;
  currentActivityEn: string;
  currentActivityBn: string;
  amenitiesEn: string[];
  amenitiesBn: string[];
  color: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  pinPosition: [number, number, number];
  interiorPosition: [number, number, number];
  interiorCameraPos: [number, number, number];
  interiorCameraTarget: [number, number, number];
}

export interface Landmark {
  id: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  position: [number, number, number];
  icon: string;
}
