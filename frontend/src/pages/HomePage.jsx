import Layout from "../components/Layout";
import CalendarHeader from "../components/CalendarHeader";
import CalendarBody from "../components/CalendarBody";
import { useState, useEffect } from 'react';
import { fetchEventsForWeek  } from '../api';

function CalendarMain({ currentDate, weekStart, weekEnd }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const res = await fetchEventsForWeek(token, weekStart, weekEnd);
      setEvents(res.data.events);
      console.log(res)
    } catch (err) {
      setEvents([]);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchEventsData();
    
    // Listen for the custom event when an event is deleted
    const handleEventDeleted = () => {
      fetchEventsData();
    };
    
    window.addEventListener('eventDeleted', handleEventDeleted);
    
    // Cleanup listener when component unmounts
    return () => {
      window.removeEventListener('eventDeleted', handleEventDeleted);
    };
  }, [token, weekStart, weekEnd]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-16 z-30 w-full">
        <CalendarHeader weekStart={weekStart} events={events} />
      </div>
      <div className="mt-0">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Đang tải...</div>
        ) : (
          <CalendarBody weekStart={weekStart} events={events} />
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Layout>
      <CalendarMain />
    </Layout>
  );
}