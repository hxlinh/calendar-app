import React from 'react';

export default function RecurringEventDialog({ isOpen, onClose, onConfirm, type, dateChanged = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
      <div className="bg-[#282828] rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {type === 'delete' ? 'Xóa sự kiện lặp lại' : 'Chỉnh sửa sự kiện lặp lại'}
          </h2>

          <div className="space-y-3">
            <button 
              onClick={() => onConfirm('single')}
              className="w-full text-left px-4 py-3 bg-[#333] hover:bg-[#444] rounded transition"
            >
              <div className="font-medium text-white">Sự kiện này</div>
              <div className="text-sm text-gray-400">Chỉ {type === 'delete' ? 'xóa' : 'chỉnh sửa'} lần xuất hiện này</div>
            </button>

            <button 
              onClick={() => onConfirm('follow')}
              className="w-full text-left px-4 py-3 bg-[#333] hover:bg-[#444] rounded transition"
            >
              <div className="font-medium text-white">Sự kiện này và các sự kiện tiếp theo</div>
              <div className="text-sm text-gray-400">{type === 'delete' ? 'Xóa' : 'Chỉnh sửa'} lần xuất hiện này và tất cả sự kiện trong tương lai</div>
            </button>            
            {!dateChanged && (
              <button 
                onClick={() => onConfirm('all')}
                className="w-full text-left px-4 py-3 bg-[#333] hover:bg-[#444] rounded transition"
              >
                <div className="font-medium text-white">Tất cả sự kiện</div>
                <div className="text-sm text-gray-400">{type === 'delete' ? 'Xóa' : 'Chỉnh sửa'} tất cả các lần xuất hiện</div>
              </button>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
