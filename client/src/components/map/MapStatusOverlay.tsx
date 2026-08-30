interface MapStatusOverlayProps {
  loading: boolean;
  empty: boolean;
}

export const MapStatusOverlay = ({ loading, empty }: MapStatusOverlayProps) => {
  if (loading) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-2 text-sm font-medium text-gray-700">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span>Megállók betöltése...</span>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3 py-1 rounded shadow-md flex items-center gap-2 text-sm font-medium text-gray-700">
        <span>Nincsenek megjelenítendő buszjáratok erre a napra. (hétvégén és ünnepnapokon nem közlekedik)</span>
      </div>
    );
  }

  return null;
};
