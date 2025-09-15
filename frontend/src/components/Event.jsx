import React, { useState } from "react";
import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import EventExtra from "./EventExtra";
import { softDeleteEvent } from "../api";
import { useNotification } from "../context/NotificationContext";

function getEventStyle(start, end, day, isOverride = false, isRecurring = false) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dayStart = new Date(day);
  const dayEnd = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Nếu sự kiện bắt đầu trước ngày hiện tại
  const effectiveStart = startDate < dayStart ? dayStart : startDate;
  // Nếu sự kiện kết thúc sau ngày hiện tại
  const effectiveEnd = endDate > dayEnd ? dayEnd : endDate;

  const hour = effectiveStart.getHours();
  const minute = effectiveStart.getMinutes();
  const duration = (effectiveEnd - effectiveStart) / (1000 * 60); // duration in minutes
  const top = hour * 48 + (minute / 60) * 48; // 48px per hour
  const height = (duration / 60) * 48;
  
  // Thêm style cho sự kiện lặp lại và override
  const backgroundColor = isOverride ? '#4f46e5' : isRecurring ? '#3b82f6' : '#3b82f6';
  const borderLeft = isOverride ? '3px solid #312e81' : isRecurring ? '3px solid #1d4ed8' : 'none';
  
  return {
    top: `${top}px`,
    height: `${Math.max(height, 24)}px`, // minimum height for visibility
    backgroundColor,
    borderLeft
  };
}

export default function Event({ event, day, overlapIndex = 0, overlapCount = 1 }) {
  const [showExtra, setShowExtra] = useState(false);
  const { startTime, endTime, title, location } = event;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const token = localStorage.getItem('token');
  const { notify } = useNotification();
  
  const style = {
    ...getEventStyle(startTime, endTime, day),
    left: `calc(4px + ${(100 / overlapCount) * overlapIndex}%)`,
    width: `calc(${100 / overlapCount}% - 8px)`,
    position: 'absolute',
    background: '#3b82f6',
    color: 'white',
    fontSize: '0.85rem',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 20,
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };

  const formattedStart = format(startDate, 'HH:mm', { locale: vi });
  const formattedEnd = format(endDate, 'HH:mm', { locale: vi });
  const isMultiDay = !isSameDay(startDate, endDate);
  const handleDelete = async (eventId, deleteType, overrideId, event) => {
    try {
      const res = await softDeleteEvent(eventId, token, deleteType, overrideId, event);
      notify(res.data.message, 'success');
      setShowExtra(false);
      // Trigger a refresh of the events list by dispatching a custom event
      window.dispatchEvent(new CustomEvent('eventDeleted'));
    } catch (error) {
      notify(error.response?.data?.message || 'Lỗi khi xóa sự kiện', 'error');
    }
  };
  
  return (
    <>
      <div 
        style={style} 
        title={`${title}\n${formattedStart} - ${formattedEnd}${location ? `\n${location}` : ''}`}
        onClick={() => setShowExtra(true)}
      >
        {title}
        <br />
        {isMultiDay && (
          <>
            {format(startDate, "dd/MM/yyyy HH:mm", { locale: vi })} -
            <br />
            {format(endDate, "dd/MM/yyyy HH:mm", { locale: vi })}
          </>
        ) || ( 
          <> 
            {formattedStart} - 
            {formattedEnd} 
          </>
        )}
        {location && (
          <>
            <br />
            {location}
          </>
        )}
      </div>
      
      {showExtra && (
        <EventExtra
          event={event}
          onClose={() => setShowExtra(false)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
