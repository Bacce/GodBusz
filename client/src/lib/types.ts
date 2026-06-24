export interface Stop {
  mid: string;
  name: string;
  lat: number;
  lon: number;
  route: string;
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
