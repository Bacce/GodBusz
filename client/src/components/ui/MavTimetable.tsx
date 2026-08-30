import { useState } from "react";
import type { MavStopEntry } from "../../lib/types";

interface MavTimetableProps {
  entries: MavStopEntry[];
}

const formatTime = (ts: number | null | undefined): string => {
  if (ts === null || ts === undefined) return "-";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "-";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const MavTimetable = ({ entries }: MavTimetableProps) => {
  const [showPast, setShowPast] = useState(false);
  const nowMs = new Date().getTime();

  const isEntryPast = (entry: MavStopEntry) => {
    const arrTs = entry.arrivalActual ?? entry.arrival;
    const depTs = entry.departureActual ?? entry.departure;
    const refTs = depTs ?? arrTs;
    return refTs ? nowMs > refTs + 120000 : false;
  };

  const pastCount = entries.filter(isEntryPast).length;

  const nextIndex = entries.findIndex((entry) => {
    const ts =
      entry.departureActual ??
      entry.departure ??
      entry.arrivalActual ??
      entry.arrival;
    return ts ? ts >= nowMs - 120000 : false;
  });

  const visibleEntries = showPast ? entries : entries.filter((entry) => !isEntryPast(entry));

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
      <div className="overflow-auto max-h-[280px]">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="border-b border-gray-200 text-gray-500 font-semibold">
              <th className="py-1 px-2 font-mono whitespace-nowrap">Érkezés</th>
              <th className="py-1 px-2 font-mono whitespace-nowrap">Indulás</th>
              <th className="py-1 px-2 whitespace-nowrap">Leírás</th>
              <th className="py-1 px-2 font-mono whitespace-nowrap">Járat</th>
            </tr>
          </thead>
          <tbody>
            {visibleEntries.map((entry) => {
              const originalIndex = entries.indexOf(entry);
              const isArrivalActualUsed = entry.arrivalActual != null;
              const arrTime = formatTime(entry.arrivalActual ?? entry.arrival);
              const schedArrTime = formatTime(entry.arrival);
              const depTime = formatTime(entry.departureActual ?? entry.departure);

              const isPast = isEntryPast(entry);
              const isNext = originalIndex === nextIndex;

              return (
                <tr
                  key={entry.trainId ? `${entry.trainId}-${originalIndex}` : originalIndex}
                  className={`border-b border-gray-100 ${
                    isPast
                      ? "text-gray-400"
                      : isNext
                        ? "text-black font-bold bg-gray-50"
                        : ""
                  }`}
                >
                  <td className="py-1 px-2 font-mono whitespace-nowrap">
                    {isArrivalActualUsed ? (
                      <div className="relative inline-block pr-6">
                        <span className="text-red-600 font-semibold">
                          {arrTime}
                        </span>
                        {entry.arrival != null && (
                          <span className="absolute top-0 right-0 text-[9px] text-black font-normal leading-none">
                            {schedArrTime}
                          </span>
                        )}
                      </div>
                    ) : (
                      arrTime
                    )}
                  </td>
                  <td className="py-1 px-2 font-mono whitespace-nowrap">{depTime}</td>
                  <td className="py-1 px-2 whitespace-nowrap">{entry.description}</td>
                  <td className="py-1 px-2 font-mono whitespace-nowrap">{entry.trainId ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
