import { useEffect, useState } from "react";

export default function CurrentTimeIndicator({ day }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);

  const isToday =
    now.toDateString() === day.toDateString();

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (!isToday) return null;

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-30"
      style={{
        top: `${currentHour * 48 + (currentMinute / 60) * 48}px`,
      }}
    />
  );
}
