import { useState } from "react";
import type { Trip } from "../../lib/types";

interface TimetableProps {
  trips: Trip[];
  date?: string;
}

export const Timetable = ({ trips, date }: TimetableProps) => {
  const [showPast, setShowPast] = useState(false);
  const now = new Date();
  const nowSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const isToday = !date || (date && new Date(date).toLocaleDateString() === now.toLocaleDateString());

  const filteredTrips = trips.filter((t) => !t.time.startsWith("00:00"));

  const isTripPast = (trip: Trip) => {
    if (!isToday) return false;
    const [h, m, s = 0] = trip.time.split(":").map(Number);
    const tripSeconds = h * 3600 + m * 60 + s;
    return nowSeconds > tripSeconds + 120;
  };

  const pastCount = filteredTrips.filter(isTripPast).length;

  const nextIndex = isToday
    ? filteredTrips.findIndex((trip) => {
        const [h, m, s = 0] = trip.time.split(":").map(Number);
        return nowSeconds <= h * 3600 + m * 60 + s + 120;
      })
    : -1;

  const visibleTrips = showPast ? filteredTrips : filteredTrips.filter((t) => !isTripPast(t));

  return (
    <div className="max-w-auto mx-auto font-sans text-xs">
      {pastCount > 0 && (
        <button
          type="button"
          onClick={() => setShowPast((prev) => !prev)}
          className="w-full mb-2 py-1 px-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors text-center cursor-pointer"
        >
          {showPast ? "Korábbi járatok elrejtése" : `Korábbi járatok megjelenítése (${pastCount})`}
        </button>
      )}
      {visibleTrips.map((trip) => {
        const originalIndex = filteredTrips.indexOf(trip);
        const isPast = isTripPast(trip);
        const isNext = isToday && originalIndex === nextIndex;

        return (
          <div
            key={trip.time}
            className={`flex justify-between py-1 border-b border-gray-100 ${
              isPast
                ? "text-gray-400"
                : isNext
                  ? "text-black font-bold bg-gray-50"
                  : ""
            }`}
          >
            <span className="font-mono text-xs">{trip.time.slice(0, -3)}</span>
            {isNext && <span className="text-xs">következő</span>}
          </div>
        );
      })}
    </div>
  );
};
