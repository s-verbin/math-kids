import { Delete } from 'lucide-react';

const NumberKeyboard = ({ onNumberClick, onDelete, onSubmit, disabled }) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-3 sm:p-4 z-50 md:hidden">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {numbers.slice(0, 9).map((num) => (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={disabled}
              className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold py-4 rounded-xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {num}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onDelete}
            disabled={disabled}
            className="bg-gradient-to-br from-red-500 to-red-600 text-white py-4 rounded-xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
          >
            <Delete size={28} />
          </button>
          <button
            onClick={() => onNumberClick('0')}
            disabled={disabled}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold py-4 rounded-xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            0
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white text-xl font-bold py-4 rounded-xl active:scale-95 transition-transform touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberKeyboard;
