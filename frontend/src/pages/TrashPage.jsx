// src/components/AuthForm.jsx
import { useState, useEffect } from 'react';
import { FaUndo, FaTrash } from 'react-icons/fa';
import { getDeletedEvents, restoreEvent, forceDeleteEvent } from '../api';
import { FaArrowLeft } from "react-icons/fa";
import ConfirmDialog from '../components/ConfirmDialog';
import { useNotification } from '../context/NotificationContext';

export default function TrashPage() {  
  const [trashEvents, setTrashEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const token = localStorage.getItem('token'); 
  const { notify } = useNotification();

  useEffect(() => {
    async function fetchTrashEvents() {
      setLoading(true);
      try {
        const res = await getDeletedEvents(token);
        setTrashEvents(res.data);
      } catch (err) {
        console.error('Error fetching deleted events:', err);
        setTrashEvents([]);
      }
      setLoading(false);
    }
    fetchTrashEvents();
  }, [token]);

  const handleRestore = async (id, isOverride) => {
    try {
      const res = await restoreEvent(id, token, isOverride);
      notify(res.data.message, 'success');
      setTrashEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      notify(err.response?.data?.message || 'Lỗi khi khôi phục sự kiện', 'error');
    }
  };
  const handleForceDelete = async (id, isOverride) => {
    // Store the event details to be used if the user confirms
    setEventToDelete({ id, isOverride });
    setConfirmDialogOpen(true);
  };
  
  const confirmForceDelete = async () => {
    try {
      if (eventToDelete) {
        const res = await forceDeleteEvent(eventToDelete.id, token, eventToDelete.isOverride);
        notify(res.data.message, 'success');
        setTrashEvents((prev) => prev.filter((ev) => ev.id !== eventToDelete.id));
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Lỗi khi xóa sự kiện', 'error');
    } finally {
      setConfirmDialogOpen(false);
      setEventToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="max-w-5xl mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="p-2.5 rounded-full hover:bg-[#333] transition-colors bg-[#222] flex items-center justify-center"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Thùng rác</h1>
        </div>
        <div className="bg-[#222] rounded-xl p-6 shadow-lg">          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Sự kiện trong thùng rác</h2>
              <p className="text-xs text-gray-400 mt-1">Sự kiện đã xóa sẽ tồn tại ở thùng rác 30 ngày trước khi bị xóa vĩnh viễn</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Đang tải...</div>
            ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a1a] text-gray-300">                  
                  <th className="px-3 py-2 text-left">Ngày</th>
                  <th className="px-3 py-2 text-left">Giờ</th>
                  <th className="px-3 py-2 text-left">Tiêu đề</th>
                  <th className="px-3 py-2 text-left">Ngày xoá</th>
                  <th className="px-3 py-2 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {trashEvents.map((event) => (
                  <tr key={event.id} className="border-b border-[#333] hover:bg-[#232323] transition">                    
                  <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(event.startTime).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'numeric', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-3 py-2 whitespace-pre-line">
                      {new Date(event.startTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(event.endTime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <span className="font-medium">{event.title}</span>
                        {event.location && (
                          <p className="text-sm text-gray-400">
                            <i className="fas fa-map-marker-alt mr-1"></i> {event.location}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(event.deletedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-3 py-2 text-center flex gap-3 justify-center">
                      <button 
                        className="p-2 rounded-full hover:bg-[#333] text-green-400" 
                        title="Khôi phục" 
                        onClick={() => handleRestore(event.id, event.isOverride)}
                      >
                        <FaUndo />
                      </button>                      <button 
                        className="p-2 rounded-full hover:bg-[#333] text-red-400" 
                        title="Xoá vĩnh viễn" 
                        onClick={() => handleForceDelete(event.id, event.isOverride)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>      <ConfirmDialog 
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={confirmForceDelete}
        title="Xóa vĩnh viễn"
        message="Sự kiện này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}
