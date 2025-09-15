const { addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears, sub } = require('date-fns');

function findPrevEvent(oriEvent, startTime) {
    const startTimeOri = new Date(oriEvent.startTime);
    const duration = new Date(oriEvent.endTime).getTime() - startTimeOri.getTime();
    let currentStart = new Date(startTime);
    // Nếu ngày tìm kiếm nhỏ hơn ngày bắt đầu, không có instance nào thỏa mãn
    if (currentStart <= startTimeOri) {
        return null;
    }

    switch (oriEvent.repeatType) {
        case 'daily':
            currentStart = subDays(currentStart, 1);
            if (currentStart >= startTimeOri) {
                return {
                    startTime: currentStart,
                    endTime: new Date(currentStart.getTime() + duration)
                }
            }

            break;

        case 'weekly':
            const allowedDays = oriEvent.repeatDays?.split(',').map(Number) || [];
            while (currentStart > startTimeOri) {
                currentStart = subDays(currentStart, 1);
                if (allowedDays.includes(currentStart.getDay()) && currentStart >= startTimeOri) {
                    return {
                    startTime: currentStart,
                    endTime: new Date(currentStart.getTime() + duration)
                    }
                }
            }

            break;

        case 'monthly':
            for (let i = 1;; i++) {
                if (subMonths(currentStart, i).getDate() === oriEvent.repeatDate) {
                    currentStart = subMonths(currentStart, i);
                    if (currentStart >= startTimeOri) {
                        return {
                            startTime: currentStart,
                            endTime: new Date(currentStart.getTime() + duration)
                        }
                    } else {
                        return null;
                    }
                }
            }

            break;

        case 'yearly':
            if (subYears(currentStart, 1).getDate() !== oriEvent.repeatDate || subYears(currentStart, 1).getMonth() !== repeatMonth){
                currentStart = subYears(currentStart, 4);
            } else {
                currentStart = subYears(currentStart, 1);
            }
            if (currentStart >= startTimeOri) {
                return {
                    startTime: currentStart,
                    endTime: new Date(currentStart.getTime() + duration)
                }
            } else {
                return null;
            }

            break;

        default:
            return null;
    }
}

module.exports = {
    findPrevEvent
};