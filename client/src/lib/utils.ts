export const normalize = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface HasLocation {
  lat: number;
  lon: number;
  id?: string | number;
}

export const findOverlappingLocations = <T extends HasLocation>(items: T[]) => {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    const key = `${lat.toFixed(12)},${lon.toFixed(12)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.values()).filter(group => group.length > 1);
};
