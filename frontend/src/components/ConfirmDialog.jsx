import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'warning' }) {
  if (!isOpen) return null;

  // Determine the color theme based on the type
  let iconColor, buttonColor, hoverColor;
  
  switch (type) {
    case 'danger':
      iconColor = 'text-red-500';
      buttonColor = 'bg-red-600';
      hoverColor = 'hover:bg-red-700';
      break;
    case 'warning':
      iconColor = 'text-yellow-500';
      buttonColor = 'bg-yellow-600';
      hoverColor = 'hover:bg-yellow-700';
      break;
    case 'success':
      iconColor = 'text-green-500';
      buttonColor = 'bg-green-600';
      hoverColor = 'hover:bg-green-700';
      break;
    case 'info':
    default:
      iconColor = 'text-blue-500';
      buttonColor = 'bg-blue-600';
      hoverColor = 'hover:bg-blue-700';
      break;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div 
        className="bg-[#282828] rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-full ${buttonColor} bg-opacity-20 mr-3`}>
              <FaExclamationCircle className={`text-xl ${iconColor}`} />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>

          <div className="text-gray-300 mb-5">
            {message}
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-[#3a3a3a] hover:bg-[#444] transition text-gray-300"
            >
              {cancelText || 'Hủy'}
            </button>
            <button 
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md ${buttonColor} ${hoverColor} transition text-white font-medium`}
            >
              {confirmText || 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
