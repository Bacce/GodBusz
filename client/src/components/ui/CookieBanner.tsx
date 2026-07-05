interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const CookieBanner = ({ onAccept, onDecline }: CookieBannerProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-[#c6c6c6] p-4 shadow-lg z-[2000] flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" fill="#B07030" />
          <circle cx="8" cy="9" r="1.2" fill="#5D2E0D" />
          <circle cx="15" cy="8" r="1.2" fill="#5D2E0D" />
          <circle cx="12" cy="13" r="1.2" fill="#5D2E0D" />
          <circle cx="17" cy="14" r="1.2" fill="#5D2E0D" />
          <circle cx="9" cy="16" r="1.2" fill="#5D2E0D" />
        </svg>
        <span className="text-gray-800 font-medium">
          Sütiket használunk az oldalmegtekintések követése céljából
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onDecline}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Elutasít
        </button>
        <button
          onClick={onAccept}
          className="bg-[#009EE3] text-white px-4 py-2 rounded-md hover:bg-[#008BCC] transition-colors text-sm font-medium"
        >
          OK
        </button>
      </div>
    </div>
  );
};
