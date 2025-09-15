const { addDays, addWeeks, addMonths, addYears } = require('date-fns');

function calculateRepeatUntil(eventData) {
    const {
        startTime,
        endTime,
        repeatType,
        repeatCount,
        repeatDays,
        repeatDate,
        repeatMonth
    } = eventData;

    if (!repeatCount || !repeatType) return null;

    const start = new Date(startTime);
    let currentDate = new Date(start);
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

    switch (repeatType) {
        case 'daily':
            return new Date(addDays(start, repeatCount - 1).getTime() + duration)

        case 'weekly':
            const allowedDays = repeatDays?.split(',').map(Number) || [];
            if (!allowedDays.length) return null;
            
            let weekCount = 0;
            let occurrenceCount = 0;

            while (occurrenceCount < repeatCount) {
                for (let day = 0; day < 7; day++) {
                    const tempDate = addDays(addWeeks(start, weekCount), day);
                    if (allowedDays.includes(tempDate.getDay())) {
                        occurrenceCount++;
                        if (occurrenceCount === repeatCount) {
                            return new Date(tempDate.getTime() + duration);
                        }
                    }
                }
                weekCount++;
            }
            return currentDate;

        case 'monthly':
            let monthCount = 1;
            let nextDate = start;
            while (monthCount < repeatCount) {
                for (let i = 1;;i++) {
                    if (addMonths(nextDate, i).getDate() === repeatDate) {
                        nextDate = addMonths(nextDate, i);
                        monthCount++;
                        break;
                    }
                }
                if (monthCount === repeatCount) {
                    return new Date(nextDate.getTime() + duration);
                }
            }
            return currentDate;

        case 'yearly':
            if (addYears(start, 1).getDate() !== repeatDate || addYears(start, 1).getMonth() !== repeatMonth)
                return new Date(addYears(start, (repeatCount - 1) * 4).getTime() + duration);
            return new Date(addYears(start, repeatCount - 1).getTime() + duration);
        default:
            return null;
    }
}

module.exports = { calculateRepeatUntil };
