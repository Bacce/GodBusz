import type { Trip } from "../../lib/types";

interface TimetableProps {
  trips: Trip[];
}

export const Timetable = ({ trips }: TimetableProps) => {
  const now = new Date().toLocaleTimeString("en-GB"); // "HH:mm:ss" format
  let nextFound = false;

  return (
    <div style={{ maxWidth: "200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {trips
        .filter((t) => !t.time.startsWith("00:00"))
        .map((trip) => {
          const isPast = trip.time < now;
          const isNext = !isPast && !nextFound;
          if (isNext) nextFound = true;

          return (
            <div
              key={trip.time}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                borderBottom: "1px solid #eee",
                color: isPast ? "lightgrey" : isNext ? "black" : "inherit",
                fontWeight: isNext ? "bold" : "normal",
                backgroundColor: isNext ? "#f9f9f9" : "transparent",
              }}
            >
              <span style={{ fontFamily: "monospace" }}>
                {trip.time.slice(0, -3)}
              </span>
              {isNext && <span style={{ fontSize: "0.8em" }}>következő</span>}
            </div>
          );
        })}
    </div>
  );
};
