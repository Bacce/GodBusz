import type { Trip } from "../../lib/types";

interface TimetableProps {
  trips: Trip[];
}

export const Timetable = ({ trips }: TimetableProps) => {
  const now = new Date();
  const nowSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const filteredTrips = trips.filter((t) => !t.time.startsWith("00:00"));

  const nextIndex = filteredTrips.findIndex((trip) => {
    const [h, m, s = 0] = trip.time.split(":").map(Number);
    return nowSeconds <= h * 3600 + m * 60 + s + 120;
  });

  return (
    <div className="max-w-50 mx-auto font-sans">
      {filteredTrips.map((trip, index) => {
        const [h, m, s = 0] = trip.time.split(":").map(Number);
        const tripSeconds = h * 3600 + m * 60 + s;

        const isPast = nowSeconds > tripSeconds + 120;
        const isNext = index === nextIndex;

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
            <span className="font-mono">{trip.time.slice(0, -3)}</span>
            {isNext && <span className="text-xs">következő</span>}
          </div>
        );
      })}
    </div>
  );
};
