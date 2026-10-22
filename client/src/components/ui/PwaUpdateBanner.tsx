import { usePwaUpdate } from "../../hooks/usePwaUpdate";

export const PwaUpdateBanner = () => {
  const { updateAvailable, updateApp, isPwaMode } = usePwaUpdate();

  if (!isPwaMode || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex-1">
          <p className="text-sm font-medium text-fg">
            Új verzió elérhető!
          </p>
          <p className="text-xs text-muted">
            Frissítsd az alkalmazást a legújabb funkciókhoz.
          </p>
        </div>
        <button
          onClick={updateApp}
          className="bg-accent text-surface px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Frissítés
        </button>
      </div>
    </div>
  );
};
