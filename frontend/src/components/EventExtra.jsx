import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import RecurringEventDialog from './RecurringEventDialog';

export default function EventExtra({ event, onClose, onDelete }) {
  const navigate = useNavigate();
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formattedStart = format(startDate, 'EEEE, dd/MM/yyyy HH:mm', { locale: vi });
  const formattedEnd = format(endDate, 'EEEE, dd/MM/yyyy HH:mm', { locale: vi });

  const handleEdit = () => {
    if (event.isOverride) {
      navigate(`/edit-event/${event.eventId}&${event.id}`, {
        state: {
          isOverride: true,
        },
      });
    } else {
      navigate(`/edit-event/${event.id}`, {
        state: {
          startTime: event.startTime,
          endTime: event.endTime,
          isOverride: false,
        },
      });
    }
  };

  const handleConfirmDelete = async (choice) => {
    const data = {
      ...event,
      originalStartTime: event.isOverride ? event.originalStartTime : event.startTime,
      originalEndTime: event.isOverride ? event.originalEndTime : event.endTime,
      id: null
    };
    try {
      if (choice === 'single') {
        if (event.isOverride) {
          await onDelete(event.eventId, 'single', event.id, data);
        } else {
          await onDelete(event.id, 'single', null, data);
        }
      } else if (choice === 'follow') {
        await onDelete(event.isOverride ? event.eventId : event.id, 'follow', null, data);
      } else if (choice === 'all') {
        await onDelete(event.isOverride ? event.eventId : event.id, 'all', null);
      }
      // Trigger a refresh of the events list
      window.dispatchEvent(new CustomEvent('eventDeleted'));
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };    
  const handleDelete = () => {
    if (event.isRecurring || event.repeatType || event.isOverride) {
      setShowDeleteDialog(true);
    } else {
      onDelete(event.id, 'single', null);
      window.dispatchEvent(new CustomEvent('eventDeleted'));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
      <div className="bg-[#282828] rounded-lg shadow-xl w-full max-w-md relative">
        {/* Header với nút đóng */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{event.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Nội dung chi tiết sự kiện */}
        <div className="p-6 space-y-4">
          {/* Thời gian */}
          <div className="flex items-start space-x-4">
            <i className="fa-regular fa-clock text-white"></i>
            <div className="text-white">
              <div>{formattedStart}</div>
              <div>{formattedEnd}</div>
              {event.repeatType && (
                <div>
                  {event.repeatType === 'daily' ? 'Hàng ngày' : null}
                  {event.repeatType === 'weekly' ? 'Hàng tuần vào ' + event.repeatDays?.split(',').map((day, index) => {
                    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                    return index === event.repeatDays.split(',').length - 1 ? dayNames[day] : (dayNames[day] + ', ');
                  }) : null}
                  {event.repeatType === 'monthly' ? 'Hàng tháng vào ngày ' + event.repeatDate : null}
                  {event.repeatType === 'yearly' ? 'Hàng năm vào ngày ' + event.repeatDate + ' tháng ' + event.repeatMonth : null}
                  {(event.repeatUntil || event.repeatCount) ? 
                    " đến " + (event.repeatUntil ? format(new Date(event.repeatUntil), 'dd/MM/yyyy') : event.repeatCount + ' lần')
                    : null}
                </div>
              )}
            </div>
          </div>

          {/* Địa điểm */}
          {event.location && (
            <div className="flex items-start space-x-4">
              <i className="fa-solid fa-location-dot text-white"></i>
              <div className="text-white">{event.location}</div>
            </div>
          )}

          {/* Mô tả */}
          {event.description && (
            <div className="flex items-start space-x-4">
              <i className="fa-regular fa-comment text-white"></i>
              <div className="text-white">{event.description}</div>
            </div>
          )}
        </div>

        {/* Footer với các nút hành động */}
        <div className="flex justify-end space-x-4 p-4 border-t border-gray-700">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
          <button
            onClick={handleEdit}
            className="text-blue-400 hover:text-blue-300"
          >
            <i className="fa-solid fa-pencil"></i>
          </button>
        </div>
      </div>

      <RecurringEventDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        type="delete"
      />
    </div>
  );
}
