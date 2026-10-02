export interface Stop {
  mid: string;
  name: string;
  lat: number;
  lon: number;
  route: string;
  dir: number | null;
  trips: Trip[];
}

export interface Trip {
  time: string;
}

export interface Bus {
  lat: number;
  lon: number;
  route: string;
  rendszam: string;
  speed: number;
}

export interface PopupData {
  title: string;
  txt: string;
}

export interface TrainStopMarkerData {
  id: string;
  lat: number;
  lng: number;
}
export interface AirMonitoringMarkerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  url: string;
}


export interface MavStopEntry {
  trainId: string | null;
  arrival: number | null;
  arrivalActual: number | null;
  departure: number | null;
  departureActual: number | null;
  track: string | null;
  description: string;
  rawDescription?: string;
}
export interface AirQualityMetric {
  rco2: number;
  pm01: number;
  pm02: number;
  pm10: number;
  atmp: number;
  rhum: number;
  tvocIndex: number;
  noxIndex: number;
  createdAt: string;
}

export interface AirQualityResponse {
  device: {
    id: string;
    name: string;
    locationId: string;
  };
  metrics: AirQualityMetric[];
}
