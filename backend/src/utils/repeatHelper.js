const { addDays, addWeeks, addMonths, addYears } = require('date-fns');

function generateRepeatEvents(eventData, userId) {
    const{
        title,
        location,
        description,
        startTime,
        endTime,
        repeatType,
        repeatUntil,
        repeatCount,
        repeatDays,
        repeatDate,
        repeatMonth,
    } = eventData;

    const events = [];
    const groupId = `group_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let currentStart = new Date(startTime)
    let currentEnd = new Date(endTime);
    const duration = currentEnd.getTime() - currentStart.getTime();
    let count = 0;

    const maxRepeat = repeatCount || 1000;
    const untilDate = repeatUntil ? new Date(repeatUntil) : null;

    switch(repeatType) {
        case 'daily':
            while (count < maxRepeat && (!untilDate || currentStart <= untilDate)) {
                events.push({
                    title,
                    location,
                    description,
                    startTime: currentStart,
                    endTime: currentEnd,
                    repeatType,
                    repeatUntil,
                    repeatCount,
                    repeatDays,
                    repeatDate,
                    repeatMonth,
                    userId,
                    groupId
                });
                currentStart = addDays(currentStart, 1);
                currentEnd = addDays(currentEnd, 1);
                count++;
            }
            break;
        case 'weekly':
            const allowedDays = repeatDays?.split(',').map(Number) || [];
            while (count < maxRepeat && (!untilDate || currentStart <= untilDate)) {
                for (let day = 0; day < 7; day++){
                    const tempStart = addDays(currentStart, day);
                    if (allowedDays.includes(tempStart.getDay())) {
                        currentEnd = new Date(tempStart.getTime() + duration);
                        if (untilDate && tempStart > untilDate) break;
                        events.push({
                            title,
                            location,
                            description,
                            startTime: tempStart,
                            endTime: currentEnd,
                            repeatType,
                            repeatUntil,
                            repeatCount,
                            repeatDays,
                            repeatDate,
                            repeatMonth,
                            userId,
                            groupId
                        });
                    count++;
                    if (count >= maxRepeat) break;
                    }
                }
                currentStart = addWeeks(currentStart, 1);
            }
            break;
        case 'monthly':
            while (count < maxRepeat && (!untilDate || currentStart <= untilDate)) {
                events.push({
                    title,
                    location,
                    description,
                    startTime: currentStart,
                    endTime: currentEnd,
                    repeatType,
                    repeatUntil,
                    repeatCount,
                    repeatDays,
                    repeatDate,
                    repeatMonth,
                    userId,
                    groupId
                });
                count++;
                for (let i = 1;;i++) {
                    if (addMonths(currentStart, i).getDate() === repeatDate) {
                        currentStart = addMonths(currentStart, i);
                        currentEnd = new Date(currentStart.getTime() + duration);
                        break;
                    }
                }
            }
            break;
        case 'yearly':
            while (count < maxRepeat && (!untilDate || currentStart <= untilDate)) {
                events.push({
                    title,
                    location,
                    description,
                    startTime: currentStart,
                    endTime: currentEnd,
                    repeatType,
                    repeatUntil,
                    repeatCount,
                    repeatDays,
                    repeatDate,
                    repeatMonth,
                    userId,
                    groupId
                });
                count++;
                if (addYears(currentStart, 1).getDate() !== repeatDate || addYears(currentStart, 1).getMonth() !== repeatMonth) {
                    currentStart = addYears(currentStart, 4);
                } else {
                    currentStart = addYears(currentStart, 1);
                }
                currentEnd = new Date(currentStart.getTime() + duration);
            }
            break;
        default:
            events.push({
                title,
                location,
                description,
                startTime,
                endTime,
                repeatType,
                userId,
            });
    }

    return events;
}

module.exports = { generateRepeatEvents };