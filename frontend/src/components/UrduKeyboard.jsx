import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const UrduKeyboard = ({ onInsert, onClose }) => {
  const [shift, setShift] = useState(false);

  // Urdu keyboard layout
  const urduKeys = [
    // Row 1 - Numbers and symbols
    ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'],
    // Row 2 - Top letters
    ['ط', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ہ', 'خ', 'ح', 'ج', 'چ'],
    // Row 3 - Home row
    ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
    // Row 4 - Bottom row
    ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'ڑ', 'و', 'ے', 'ۃ'],
  ];

  // Special characters and punctuation
  const specialKeys = ['ء', 'آ', 'أ', 'ؤ', 'إ', 'ئ', 'ً', 'ٌ', 'ٍ', 'َ', 'ُ', 'ِ', 'ّ', 'ْ'];
  const punctuation = ['۔', '،', '؛', '؟', '!', '(', ')', '"', "'", '-', '_', '/', '\\'];

  const handleKeyPress = (key) => {
    onInsert(key);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 md:p-4 rounded-t-3xl md:rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <h3 className="text-lg md:text-xl font-bold">اردو کی بورڈ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard */}
        <div className="p-3 md:p-4 space-y-2">
          {/* Main letter rows */}
          {urduKeys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 md:gap-1.5 flex-wrap">
              {row.map((key, keyIndex) => (
                <button
                  key={keyIndex}
                  onClick={() => handleKeyPress(key)}
                  className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white text-lg md:text-xl font-bold px-2 md:px-3 py-2 md:py-2.5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all min-w-[36px] md:min-w-[42px] border border-gray-300 dark:border-gray-600 active:scale-95"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}

          {/* Special characters */}
          <div className="mt-3 md:mt-4">
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold">
              خاص حروف
            </p>
            <div className="flex justify-center gap-1 flex-wrap">
              {specialKeys.map((key, index) => (
                <button
                  key={index}
                  onClick={() => handleKeyPress(key)}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-gray-900 dark:text-white text-base md:text-lg font-bold px-2 py-1.5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all min-w-[32px] border border-purple-200 dark:border-purple-700 active:scale-95"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Punctuation */}
          <div className="mt-2 md:mt-3">
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-semibold">
              رموز اوقاف
            </p>
            <div className="flex justify-center gap-1 flex-wrap">
              {punctuation.map((key, index) => (
                <button
                  key={index}
                  onClick={() => handleKeyPress(key)}
                  className="bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 text-gray-900 dark:text-white text-base md:text-lg font-bold px-2 py-1.5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all min-w-[32px] border border-green-200 dark:border-green-700 active:scale-95"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Space and control buttons */}
          <div className="flex justify-center gap-2 mt-3 md:mt-4">
            <button
              onClick={() => handleKeyPress(' ')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm md:text-base font-bold px-8 md:px-12 py-2 md:py-2.5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all active:scale-95"
            >
              اسپیس
            </button>
            <button
              onClick={() => handleKeyPress('\n')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm md:text-base font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all active:scale-95"
            >
              نئی لائن
            </button>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm md:text-base font-bold px-4 md:px-6 py-2 md:py-2.5 rounded-lg shadow hover:shadow-md hover:scale-105 transition-all active:scale-95"
            >
              بند کریں
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrduKeyboard;