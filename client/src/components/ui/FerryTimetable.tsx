import { useState } from "react";
import type { FerryTime } from "../../lib/types";

interface FerryTimetableProps {
  times: FerryTime[];
}

export const FerryTimetable = ({ times }: FerryTimetableProps) => {
  const [showPast, setShowPast] = useState(false);
  const now = new Date();
  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const isTripPast = (trip: FerryTime) => {
    const tripSeconds = trip.hour * 3600 + trip.minute * 60;
    return nowSeconds > tripSeconds + 60;
  };

  const filteredTimes = times.slice().sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
  const pastCount = filteredTimes.filter(isTripPast).length;
  const visibleTimes = showPast ? filteredTimes : filteredTimes.filter((t) => !isTripPast(t));

  const getRecurrenceLabel = (recurrence: FerryTime["recurrence"]) => {
    switch (recurrence) {
      case "every-day": return "";
      case "workday": return "Munkanapokon";
      case "holiday-weekend": return "Hétvégén és Ünnepnapokon";
      case "school-day": return "Tanítási napokon";
      default: return "";
    }
  };

  const getRecurrenceIcon = (recurrence: FerryTime["recurrence"]) => {
    switch (recurrence) {
      case "workday": return "💼 ";
      case "holiday-weekend": return "🏖️ ";
      case "school-day": return "📚 ";
      default: return "";
    }
  };

  return (
    <div className="max-w-auto mx-auto font-sans text-xs w-[350px]">

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
              <th className="py-1 px-2 font-mono whitespace-nowrap">Indulás</th>
              <th className="py-1 px-2 whitespace-nowrap">Megjegyzés</th>
            </tr>
          </thead>
          <tbody>
            {visibleTimes.map((trip, idx) => {
              const isPast = isTripPast(trip);
              return (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 ${isPast ? "text-gray-400" : ""}`}
                >
                  <td className="py-1 px-2 font-mono whitespace-nowrap">
                    {trip.hour.toString().padStart(2, "0")}:{trip.minute.toString().padStart(2, "0")}
                  </td>
                  <td className="py-1 px-2 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      {getRecurrenceIcon(trip.recurrence)}
                      {getRecurrenceLabel(trip.recurrence)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
