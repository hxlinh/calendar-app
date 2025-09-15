import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isToday, startOfDay } from "date-fns";
import vi from "date-fns/locale/vi";
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ currentDate: propCurrentDate, setWeekStart, setWeekEnd, setCurrentDate }) {
  const [vnTime, setVnTime] = useState('');
  const [currentDate, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();

  // Update the sidebar calendar when propCurrentDate changes (e.g. when "today" button is clicked)
  useEffect(() => {
    if (propCurrentDate) {
      setCurrentMonth(propCurrentDate);
    }
  }, [propCurrentDate]);
  
  useEffect(() => {
    const updateVietnamTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vietnamTime = new Date(utc + 7 * 60 * 60000);
      setVnTime(format(vietnamTime, "HH:mm:ss"));
    };

    updateVietnamTime();
    const interval = setInterval(updateVietnamTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateEvent = () => {
    navigate("/create-event");
  }

  const handleDateClick = (day) => {
    // Update the parent component's state to show the week containing the selected date
    if (setCurrentDate) {
      setCurrentDate(day);
    }
    
    if (setWeekStart && setWeekEnd) {
      const newWeekStart = startOfWeek(day, { weekStartsOn: 1 });
      const newWeekEnd = endOfWeek(day, { weekStartsOn: 1 });
      
      setWeekStart(newWeekStart);
      setWeekEnd(newWeekEnd);
    }
    
    // Navigate to home to make sure we show the calendar
    navigate("/home");
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <div
            key={day}
            className={`py-1 text-xs text-center rounded hover:bg-gray-600 cursor-pointer ${
              isSameMonth(day, monthStart) ? (isToday(day) ? "bg-blue-500 text-white" : "text-white") : "text-gray-500"
            }`}
            onClick={() => handleDateClick(startOfDay(cloneDay))}
          >
            {format(day, "d")}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className="fixed left-0 top-16 w-70 h-screen p-4 border-r border-gray-700 flex flex-col justify-between bg-[#2c2c2c]">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-calendar"></i> 
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Lịch</span>
          </h1>
        </div>
        <button 
          className="bg-[#515151] text-white w-full py-2 rounded mb-4 hover:bg-blue-600 cursor-pointer transition duration-200"
          onClick={handleCreateEvent}
        >
          + Tạo
        </button>
        <div className="text-sm text-gray-400 mb-2 flex">
          {format(currentDate, "MMMM, yyyy", { locale: vi })}
          <div className="flex items-center gap-2 ml-auto">
            <i className="fa-solid fa-angle-left text-white cursor-pointer hover:text-gray-400" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}></i>
            <i className="fa-solid fa-angle-right text-white cursor-pointer hover:text-gray-400" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}></i>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-300 mb-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        {renderCalendar()}
        
        <div className="mt-6">
          <p className="text-sm text-gray-400">Giờ Việt Nam</p>
          <p className="text-sm text-white">{vnTime}</p>
        </div>
      </div>
    </div>
  );
}
