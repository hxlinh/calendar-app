const { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, isSameDay, setDate } = require('date-fns');

function generateEventInstances(event, startRange, endRange) {
  const {
    startTime,
    endTime,
    repeatType,
    repeatUntil,
    repeatDays,
    repeatDate,
    repeatMonth,
  } = event;

  if (!repeatType) {
    if (isEventInRange(event, startRange, endRange)) {
      return [{ ...event }];
    }
    return [];
  }
  startRange = new Date(startRange);
  endRange = new Date(endRange);
  const instances = [];
  const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
  const eventStartTime = new Date(startTime);
  const eventStartHour = eventStartTime.getHours();
  const eventStartMinute = eventStartTime.getMinutes();
  
  // Đặt currentStart là ngày của startRange với giờ của sự kiện gốc
  let currentStart = new Date(startRange);
  currentStart.setHours(eventStartHour, eventStartMinute, 0, 0);
  
  if (startRange < eventStartTime) {
    currentStart = new Date(eventStartTime);
  }

  const untilDate = repeatUntil ? new Date(repeatUntil) : null;
    
  switch (repeatType) {
    case 'daily':
      while (!untilDate || currentStart <= untilDate) {
        if (endRange && isAfter(currentStart, endRange)) break;
        if (isEventInRange({ startTime: currentStart, endTime: new Date(currentStart.getTime() + duration) }, startRange, endRange)) {
          instances.push({
            startTime: new Date(currentStart),
            endTime: new Date(currentStart.getTime() + duration)
          });
        }
        currentStart = addDays(currentStart, 1);
      }
      break;

    case 'weekly':
      const allowedDays = repeatDays?.split(',').map(Number) || [];
      while (!untilDate || currentStart <= untilDate) {
        if (endRange && isAfter(currentStart, endRange)) break;
        if ((allowedDays.includes(currentStart.getDay())) && (isEventInRange({ startTime: currentStart, endTime: new Date(currentStart.getTime() + duration) }, startRange, endRange))) {
          instances.push({
            startTime: new Date(currentStart),
            endTime: new Date(currentStart.getTime() + duration)
          });
        }
        currentStart = addDays(currentStart, 1);
      }
      break;

  case 'monthly':
      currentStart.setDate(repeatDate);
      if ((!untilDate || currentStart <= untilDate) && (currentStart.getDate() === repeatDate) && (isEventInRange({ startTime: currentStart, endTime: new Date(currentStart.getTime() + duration) }, startRange, endRange))) {
        instances.push({
          startTime: new Date(currentStart),
          endTime: new Date(currentStart.getTime() + duration)
        });
        break;
      }
      if (startRange.getMonth() !== endRange.getMonth()) {
        currentStart = new Date(endRange);
        currentStart.setHours(eventStartHour, eventStartMinute, 0, 0);
        currentStart.setDate(repeatDate);
        if ((!untilDate || currentStart <= untilDate) && isEventInRange({ startTime: currentStart, endTime: new Date(currentStart.getTime() + duration) }, startRange, endRange)) {
          instances.push({
            startTime: new Date(currentStart),
            endTime: new Date(currentStart.getTime() + duration)
          });
        }
      }
      break;

    case 'yearly':
      currentStart.setDate(repeatDate);
      currentStart.setMonth(repeatMonth);
      if ((!untilDate || currentStart <= untilDate) && (currentStart.getDate() === repeatDate) && (isEventInRange({ startTime: currentStart, endTime: new Date(currentStart.getTime() + duration) }, startRange, endRange))) {
        instances.push({
          startTime: new Date(currentStart),
          endTime: new Date(currentStart.getTime() + duration)
        });
        break;
      }
      if (startRange.getFullYear() !== endRange.getFullYear()) {
        currentStart.setDate(repeatDate);
        currentStart.setMonth(repeatMonth);
        currentStart.setFullYear(endRange.getFullYear());
        if ((!untilDate || currentStart <= untilDate) && isEventInRange({ startTime: currentStart, endTime: new Date(currentStart.getTime() + duration) }, startRange, endRange)) {
          instances.push({
            startTime: new Date(currentStart),
            endTime: new Date(currentStart.getTime() + duration)
          });
        }
      }
      break;

    default:
      console.error('Unsupported repeat type:', repeatType);
      break;
  }

  return instances;
}

function isEventInRange(event, startRange, endRange) {
  const eventStart = new Date(event.startTime);
  const eventEnd = new Date(event.endTime);

  if (!startRange || !endRange) return true;

  const start = new Date(startRange);
  const end = new Date(endRange);

  return (
    // Sự kiện bắt đầu trong khoảng
    (isAfter(eventStart, start) && isBefore(eventStart, end)) ||
    // Sự kiện kết thúc trong khoảng
    (isAfter(eventEnd, start) && isBefore(eventEnd, end)) ||
    // Sự kiện bao trùm khoảng thời gian
    (isBefore(eventStart, start) && isAfter(eventEnd, end)) ||
    // Sự kiện bắt đầu đúng ngày start hoặc end
    isSameDay(eventStart, start) ||
    isSameDay(eventStart, end) ||
    // Sự kiện kết thúc đúng ngày start hoặc end
    isSameDay(eventEnd, start) ||
    isSameDay(eventEnd, end)
  );
}

module.exports = { generateEventInstances, isEventInRange };
