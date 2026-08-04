import { Delete } from 'lucide-react';

const NumberKeyboard = ({ onNumberClick, onDelete, onSubmit, disabled }) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-white/30 shadow-2xl p-2 sm:p-3 pb-[env(safe-area-inset-bottom)] z-50 md:hidden">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {numbers.slice(0, 9).map((num) => (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={disabled}
              className="bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 text-2xl font-bold min-h-[56px] rounded-2xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {num}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onDelete}
            disabled={disabled}
            className="bg-red-500/80 backdrop-blur-md text-white min-h-[56px] rounded-2xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
          >
            <Delete size={24} />
          </button>
          <button
            onClick={() => onNumberClick('0')}
            disabled={disabled}
            className="bg-white/60 backdrop-blur-md border border-white/50 text-gray-800 text-2xl font-bold min-h-[56px] rounded-2xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            0
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="bg-green-500/80 backdrop-blur-md text-white text-xl font-bold min-h-[56px] rounded-2xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberKeyboard;
