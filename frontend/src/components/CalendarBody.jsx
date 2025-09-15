import React from "react";
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import Event from "./Event";
import CurrentTimeIndicator from "./CurrentTimeIndicator";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarBody({ weekStart, events = [] }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Kiểm tra xem sự kiện có diễn ra trong ngày không
  const isEventInDay = (event, day) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    return isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
           isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
           isWithinInterval(eventStart, { start: dayStart, end: dayEnd });
  };

  // Hàm kiểm tra overlap giữa 2 event
  const isOverlap = (a, b) => {
    const aStart = new Date(a.startTime);
    const aEnd = new Date(a.endTime);
    const bStart = new Date(b.startTime);
    const bEnd = new Date(b.endTime);
    return aStart < bEnd && bStart < aEnd;
  };

  // Gom nhóm các event trùng thời gian trong 1 ngày
  const groupOverlappingEvents = (events) => {
    const groups = [];
    events.forEach(event => {
      let placed = false;
      for (const group of groups) {
        if (group.some(e => isOverlap(e, event))) {
          group.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([event]);
    });
    return groups;
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#181818] mt-18">
      <div className="flex flex-row flex-1 relative overflow-x-auto" style={{height: 'calc(100vh - 120px)'}}>
        {/* Time column */}
        <div className="flex flex-col w-14 text-xs text-gray-400 pt-2 bg-[#181818] sticky left-0 z-20">
          {HOURS.map((h) => (
            <div key={h} className="h-12 text-right pr-2 select-none bg-[#181818]">
              {h}:00
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 relative" style={{minWidth: 0}}>
          {days.map((day, dayIdx) => {
            // Lọc event trong ngày này
            const dayEvents = events.filter(ev => isEventInDay(ev, day));
            // Gom nhóm overlap
            const groups = groupOverlappingEvents(dayEvents);
            return (
              <div key={dayIdx} className="border-l border-gray-700 relative">
                <CurrentTimeIndicator day={day} />
                {HOURS.map((h) => (
                  <div key={h} className="h-12 border-b border-gray-800 relative group"></div>
                ))}
                {/* Render events cho ngày này, chia đều chiều ngang */}
                {groups.map((group, groupIdx) =>
                  group.map((ev, i) => (
                    <Event
                      key={ev.id || `${groupIdx}-${i}`}
                      event={ev}
                      day={day}
                      overlapIndex={i}
                      overlapCount={group.length}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
