import { X } from 'lucide-react';

export default function Banner({ isVisible, onClose, navigateToPage }) {
  if (!isVisible) return null;

  return (
    <div className="bg-kiwi-yellow w-full px-4 py-2 flex items-start sm:items-center justify-between gap-2 text-sm font-medium z-50 relative">
      <div className="flex-1 min-w-0 flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-center">
        <span className="font-bold border border-black px-2 py-0.5 rounded text-xs shrink-0">Limited Time Offer</span>
        <span className="min-w-0 break-words">UNLIMITED access for Pro members with 3,000 credits or more! (14 days)</span>
        <button 
          onClick={() => {
            if (navigateToPage) {
              navigateToPage('pricing', '/pricing');
            }
            onClose();
          }}
          className="bg-black text-white px-4 py-1 rounded-full text-xs font-bold hover:bg-gray-800 transition shrink-0"
        >
          Try Now
        </button>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-yellow-400 rounded-full transition shrink-0 self-start">
        <X size={16} />
      </button>
    </div>
  );
}
