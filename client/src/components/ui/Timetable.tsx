import type { Trip } from "../../lib/types";

interface TimetableProps {
  trips: Trip[];
}

export const Timetable = ({ trips }: TimetableProps) => {
  const now = new Date().toLocaleTimeString("en-GB"); // "HH:mm:ss" format
  let nextFound = false;

  return (
    <div className="max-w-[200px] mx-auto font-sans">
      {trips
        .filter((t) => !t.time.startsWith("00:00"))
        .map((trip) => {
          const isPast = trip.time < now;
          const isNext = !isPast && !nextFound;
          if (isNext) nextFound = true;

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
