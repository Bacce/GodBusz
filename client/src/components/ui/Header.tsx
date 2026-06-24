import { BUS_ICON_URL_HEADER } from "../../lib/constants";

interface HeaderProps {
  polling: boolean;
  onTogglePolling: () => void;
}

export const Header = ({ polling, onTogglePolling }: HeaderProps) => (
  <header className="flex items-center justify-between h-13.5 bg-white border-b-[3px] border-[#c6c6c6] px-4">
    <img src="/logo_godgo.png" alt="Logo" className="max-h-full" />
    <div className="flex gap-2">
      <button
        onClick={onTogglePolling}
        className={`pl-2 pr-4 py-1 rounded w-fit flex items-center gap-2 transition-colors ${
          polling
            ? "bg-[#009EE3] text-white"
            : "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100"
        }`}
      >
        <img src={BUS_ICON_URL_HEADER} alt="" />
        Járművek követése
      </button>
    </div>
  </header>
);
