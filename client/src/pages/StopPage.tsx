import { useParams } from 'react-router-dom';
import { useStop } from '../hooks/useStop';
import { Timetable } from '../components/ui/Timetable';

export const StopPage = ({ selectedDate }: { selectedDate: string }) => {
  const { mid } = useParams<{ mid: string }>();
  const { stop, loading, error } = useStop(mid || '', selectedDate);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error || !stop) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>Nincsenek megjelenítendő járatok erre a napra.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">{stop.name}</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Menetrend</h2>
        <Timetable trips={stop.trips} />
      </div>
    </div>
  );
};
