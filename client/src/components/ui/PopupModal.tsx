import DOMPurify from "dompurify";
import type { PopupData } from "../../lib/types";

interface PopupModalProps {
  popup: PopupData;
  onDismiss: () => void;
}

export const PopupModal = ({ popup, onDismiss }: PopupModalProps) => (
  <div
    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
    onClick={onDismiss}
  >
    <div
      className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative p-6 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        onClick={onDismiss}
      >
        ✕
      </button>
      <h2 className="text-xl font-bold mb-4">{popup.title}</h2>
      <div
        className="text-gray-700"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(popup.txt ?? ""),
        }}
      />
    </div>
  </div>
);
