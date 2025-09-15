import React, { useState } from "react";
import Header from "./HomeHeader";
import Sidebar from "../components/Sidebar";
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

export default function Layout({ children }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const [weekEnd, setWeekEnd] = useState(endOfWeek(currentDate, { weekStartsOn: 1 }));
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setWeekEnd(endOfWeek(new Date(), { weekStartsOn: 1 }))
  }
    
  const nextWeek = () => {
    setCurrentDate(date => addWeeks(date, 1));
    setWeekStart(date => addWeeks(date, 1))
    setWeekEnd(date => addWeeks(date, 1))
  } 

  const prevWeek = () => {
    setCurrentDate(date => subWeeks(date, 1));
    setWeekStart(date => subWeeks(date, 1))
    setWeekEnd(date => subWeeks(date, 1))
  } 

  return (
    <div className="flex flex-col min-h-screen bg-[#181818]">
      <Header 
        weekEnd={weekEnd}
        onNextWeek={nextWeek}
        onPrevWeek={prevWeek}
        onToday={goToToday}
      />
      <div className="flex flex-1">
        <Sidebar 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate}
          setWeekStart={setWeekStart}
          setWeekEnd={setWeekEnd}
        />
        <main className="flex-1 ml-[280px]">
          {React.cloneElement(children, { currentDate, weekStart, weekEnd })}
        </main>
      </div>
    </div>
  );
}
