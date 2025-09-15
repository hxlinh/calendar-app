import React from "react";
import { format, addDays, startOfWeek, isToday } from "date-fns";
import vi from "date-fns/locale/vi";

export default function CalendarHeader({ weekStart, events = [] }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Hàm kiểm tra event kéo dài qua ngày này
  // const getMultiDayEvents = (day) => {
  //   return events.filter((ev) => {
  //     const start = new Date(ev.startTime);
  //     const end = new Date(ev.endTime);
  //     // Event bắt đầu trước ngày này và kết thúc sau ngày này
  //     return start < day && end > addDays(day, 1);
  //   });
  // };

  return (
    <div
      className="flex flex-row border-b border-gray-700 bg-[#232323]"
      style={{ minWidth: 0 }}
    >
      <div className="w-14 bg-[#232323] sticky left-0 z-20" />
      {days.map((day, idx) => {
        // const multiDayEvents = getMultiDayEvents(day);
        return (
          <div
            key={idx}
            className={`flex-1 py-2 px-2 text-center text-sm font-semibold ${
              isToday(day) ? "text-blue-500" : "text-white"
            } bg-[#232323]`}
            style={{ minWidth: 0 }}
          >
            {format(day, "EEE", { locale: vi })} <br />
            <span
              className={`inline-block w-8 h-8 leading-8 rounded-full ${
                isToday(day) ? "bg-blue-600 text-white" : ""
              }`}
            >
              {format(day, "d")}
            </span>
            {/* Hiển thị event kéo dài qua ngày */}
            {/* {multiDayEvents.map((ev) => (
              <div
                key={ev.id}
                className="mt-1 text-xs bg-blue-900 bg-opacity-60 rounded p-1"
              >
                <div className="truncate">{ev.title}</div>
                <div>
                  {format(new Date(ev.startTime), "HH:mm")} -{" "}
                  {format(new Date(ev.endTime), "HH:mm")}
                </div>
              </div>
            ))} */}
          </div>
        );
      })}
    </div>
  );
}