const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateEventInstances } = require('../../utils/recurrenceHelper');
const { calculateRepeatUntil } = require('../../utils/dateHelper');
const { findPrevEvent } = require('../../utils/findPrevEventHelper');

const createEvent = async (req, res) => {
    const data = req.body;
    const userId = req.user.userId;

    try {
        // Nếu có repeatCount, tính toán repeatUntil
        let eventData = { ...data };
        if (data.repeatCount && !data.repeatUntil) {
            const calculatedUntil = calculateRepeatUntil(data);
            if (calculatedUntil) {
                eventData.repeatUntil = calculatedUntil;
            }
        }

        // Create a single event record with repeat options
        const event = await prisma.event.create({
            data: {
                ...eventData,
                userId,
                groupId: eventData.repeatType ? `group_${Date.now()}_${Math.floor(Math.random() * 1000)}` : null
            }
        });
        return res.json({
            ...event,
            message: "Sự kiện đã được tạo thành công"
        });
    } catch (error) {
        return res.status(400).json({ message: "Lỗi khi tạo sự kiện", error: error.message });
    }
};

const getEventById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                overrides: true
            }
        });

        if (!event || event.userId !== parseInt(userId)) {
            return res.status(404).json({ message: "Không tìm thấy sự kiện" });
        }

        res.json(event);
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi tải sự kiện", error: error.message });
    }
};

const getEventsForWeek = async (req, res) => {
    const { userId } = req.user;
    const { startDate, endDate } = req.query;

    try {
        // Get base events
        const events = await prisma.event.findMany({
            where: {
                userId: parseInt(userId),
                deletedAt: null,
                OR: [
                    // Non-recurring events
                    {
                        repeatType: null,
                        startTime: { gte: new Date(startDate), lte: new Date(endDate) }
                    },
                    {
                        repeatType: null,
                        endTime: { gte: new Date(startDate), lte: new Date(endDate) }
                    },
                    {
                        repeatType: null,
                        startTime: { lte: new Date(startDate) },
                        endTime: { gte: new Date(endDate) }
                    },
                    // Recurring events that haven't ended
                    {
                        repeatType: { not: null },
                        OR: [
                            { repeatUntil: null },
                            { repeatUntil: { gte: new Date(startDate) } }
                        ],
                        startTime: { lte: new Date(endDate) }
                    }
                ]
            },
            include: {
                overrides: {
                    where: {
                        OR: [
                            {
                                startTime: { gte: new Date(startDate), lte: new Date(endDate) },
                                // deletedAt: null
                            },
                            {
                                // deletedAt: null,
                                endTime: { gte: new Date(startDate), lte: new Date(endDate) }
                            },
                            {
                                // deletedAt: null,
                                startTime: { lte: new Date(startDate) },
                                endTime: { gte: new Date(endDate) }
                            },
                        ]
                    }
                }
            }
        });

        // Process events and generate instances
        const processedEvents = [];
        events.forEach(event => {
            if (!event.repeatType) {
                // Non-recurring event
                processedEvents.push(event);
            } else {
                // Generate instances for recurring event
                const instances = generateEventInstances(event, startDate, endDate);
                instances.forEach(instance => {
                    // Check for override
                    const override = event.overrides.find(o => 
                        o.originalStartTime.getTime() === instance.startTime.getTime()
                        // && o.eventId === instance.id
                    );

                    if (override) {
                        if (!override.deletedAt) {
                            processedEvents.push({
                                ...override,
                                isOverride: true,
                                originalEventId: event.id
                            });
                        }
                    } else {
                        processedEvents.push({
                            ...event,
                            startTime: instance.startTime,
                            endTime: instance.endTime,
                            isRecurring: true
                        });
                    }
                });
            }
        });
        res.json({ events: processedEvents });
    } catch (error) {
        res.status(400).json({ message: "Error fetching events", error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const updateType = req.query.updateType;  // 'single', 'follow', 'all'
    const overrideId = req.query.overrideId; 
    const data = req.body;
    const userId = req.user.userId;

    const currentEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: { overrides: true }
    });

    if (!currentEvent) return res.status(404).json({ message: "Event not found" });
    if (currentEvent.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "You don't have permission to update this event" });
    }

    try {
        let result;

        if (currentEvent.repeatType) {
            switch (updateType) {
                case 'single':
                    if (overrideId) {
                        // Update the override
                        result = await prisma.eventOverride.update({
                            where: { id: parseInt(overrideId) },
                            data: {
                                ...data,
                                eventId: currentEvent.id,
                            }
                        });
                    } else {
                        // Create an override for this instance
                        result = await prisma.eventOverride.create({
                            data: {
                                ...data,
                                eventId: currentEvent.id,
                                // originalStartTime: new Date(data.originalStartTime),
                                // originalEndTime: new Date(data.originalEndTime)
                            }
                        });
                    }
                    break;

                case 'follow':
                    const {originalStartTime, originalEndTime, ...filterPayload} = data;

                    let newEventData = { ...filterPayload };
                    if (filterPayload.repeatCount && !filterPayload.repeatUntil) {
                        const calculatedUntil = calculateRepeatUntil(filterPayload);
                        if (calculatedUntil) {
                            newEventData.repeatUntil = calculatedUntil;
                        }
                    }
                    // Create a new event starting from modified date
                    const newEvent = await prisma.event.create({
                        data: {
                            ...newEventData,
                            userId: currentEvent.userId,
                            groupId: currentEvent.groupId
                        }
                    });
                    
                    // Tìm instance cuối cùng trước ngày tách
                    const prevInstance = findPrevEvent(currentEvent, originalStartTime);
                    // Update end date of original event using prev instance's end time
                    if (prevInstance) {
                        await prisma.event.update({
                            where: { id: currentEvent.id },
                            data: {
                                repeatUntil: new Date(prevInstance.endTime)
                            }
                        });
                    } else {
                        // Nếu không tìm thấy instance nào trước ngày tách, xóa event
                        await prisma.event.delete({
                            where: { id: currentEvent.id }
                        });
                    }
                    
                    // Delete event that are after the new event's start time
                    await prisma.event.deleteMany({
                        where: {
                            groupId: currentEvent.groupId,
                            startTime: { gte: new Date(data.startTime) },
                            id: { not: newEvent.id }
                        }
                    });

                    result = newEvent;
                    break;

                case 'all':
                    const earliestEvent = await prisma.event.findFirst({
                        where: { groupId: currentEvent.groupId },
                        orderBy: { startTime: 'asc' }
                    });
                    const datePartStartTime = new Date(earliestEvent.startTime).toISOString().split('T')[0];
                    const timePartStartTime = new Date(data.startTime).toISOString().split('T')[1];
                    const newStartTime = new Date(`${datePartStartTime}T${timePartStartTime}`);
                    const duration = new Date(data.endTime) - new Date(data.startTime);
                    const newEndTime = new Date(newStartTime.getTime() + duration);

                    await prisma.eventOverride.deleteMany({
                        where: {
                            eventId: earliestEvent.id,
                        }
                    });

                    await prisma.event.deleteMany({
                        where: {
                            groupId: currentEvent.groupId,
                            id: { not: earliestEvent.id }
                        }
                    });
                    // Update the original event
                    result = await prisma.event.update({
                        where: { id: earliestEvent.id },
                        data: {
                            ...data,
                            startTime: newStartTime,
                            endTime: newEndTime,
                        }
                    });
                    break;

                default:
                    return res.status(400).json({ message: "Invalid update type" });
            }
        } else {
            // Non-recurring event, just update it
            result = await prisma.event.update({
                where: { id: currentEvent.id },
                data
            });        }
        
        // Add success message to result
        result.message = "Sự kiện đã được cập nhật thành công";
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật sự kiện", error: error.message });
    }
};

const softDeleteEvent = async (req, res) => {
    const { id } = req.params;
    const deleteType = req.query.deleteType;  // 'single', 'follow', 'all'
    const overrideId = req.query.overrideId; 
    const data = req.body;
    const userId = req.user.userId;

    const currentEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: { overrides: true }
    });

    if (!currentEvent) return res.status(404).json({ message: "Event not found" });
    if (currentEvent.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "You don't have permission to delete this event" });
    }
    
    let result;
    if (currentEvent.repeatType) {
        switch (deleteType) {            
            case 'single':
                if (overrideId) {
                    // Soft delete the override
                    result = await prisma.eventOverride.update({
                        where: { id: parseInt(overrideId) },
                        data: { deletedAt: new Date() }
                    });
                } else {
                    // Soft delete the specific instance by creating an override
                    result = await prisma.eventOverride.create({
                        data: {
                            eventId: currentEvent.id,
                            startTime: new Date(data.startTime),
                            endTime: new Date(data.endTime),
                            title: currentEvent.title,
                            location: currentEvent.location,
                            description: currentEvent.description,
                            deletedAt: new Date(),
                            originalStartTime: new Date(data.originalStartTime),
                            originalEndTime: new Date(data.originalEndTime)
                        }
                    });
                }
                break;            
                case 'follow':
                    // Find the last instance before the split
                    const prevInstance = findPrevEvent(currentEvent, data.originalStartTime);
                    
                    // Update end date of original event using prev instance's end time
                    if (prevInstance) {
                        // Soft delete all future instances by creating an override
                        result = await prisma.event.create({
                            data: {
                                title: currentEvent.title,
                                location: currentEvent.location,
                                description: currentEvent.description,
                                startTime: new Date(data.startTime),
                                endTime: new Date(data.endTime),
                                deletedAt: new Date(),
                                repeatType: currentEvent.repeatType,
                                repeatDays: currentEvent.repeatDays,
                                repeatDate: currentEvent.repeatDate,
                                repeatMonth: currentEvent.repeatMonth,
                                endType: currentEvent.endType,
                                repeatUntil: currentEvent.repeatUntil,
                                repeatCount: currentEvent.repeatCount,
                                groupId: currentEvent.groupId,
                                userId: currentEvent.userId,
                            }
                        });
                        await prisma.event.update({
                            where: { id: currentEvent.id },
                            data: {
                                repeatUntil: new Date(prevInstance.endTime)
                            }
                        });
                    } else {
                        // If no instance found before split date, soft delete the event
                        await prisma.event.update({
                            where: { id: currentEvent.id },
                            data: {
                                deletedAt: new Date()
                            }
                        });
                    }
                    
                    // Set deletedAt for all overrides after the split date
                    // await prisma.event.updateMany({
                    //     where: {
                    //         groupId: currentEvent.groupId,
                    //         startTime: { gte: new Date(data.startTime) }
                    //     },
                    //     data: {
                    //         deletedAt: new Date()
                    //     }
                    // });
                    break;
            case 'all':
                await prisma.event.updateMany({
                    where: {
                        groupId: currentEvent.groupId,
                    },
                    data: { deletedAt: new Date() }
                })
                break;

            default:
                return res.status(400).json({ message: "Invalid update type" });
        }
    } else {
        // Non-recurring event, just soft delete it
        await prisma.event.update({
            where: { id: currentEvent.id },
            data: { deletedAt: new Date() }
        });    }
    res.json({
        ...result,
        message: "Sự kiện đã được chuyển vào thùng rác"
    });
}

const restoreEvent = async (req, res) => {
    const { id } = req.params;
    const isOverride = req.query.isOverride === 'true';
    const userId = req.user.userId;

    try {
        if (isOverride) {
            // First check if the override exists and if the user owns the parent event
            const override = await prisma.eventOverride.findFirst({
                where: { id: parseInt(id) },
                include: { event: true }
            });
            
            if (!override) {
                return res.status(404).json({ message: "Event not found" });
            }
            
            if (override.event.userId !== parseInt(userId)) {
                return res.status(403).json({ message: "You don't have permission to restore this event" });
            }

            // Mark the override as restored
            await prisma.eventOverride.update({
                where: { id: parseInt(id) },
                data: { deletedAt: null }
            });
        } else {
            // Check if user owns the event
            const event = await prisma.event.findUnique({
                where: { id: parseInt(id) }
            });

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            if (event.userId !== parseInt(userId)) {
                return res.status(403).json({ message: "You don't have permission to restore this event" });
            }

            // Restore the event
            await prisma.event.update({
                where: { id: parseInt(id) },
                data: { deletedAt: null }
            });
        }
        res.json({ message: "Sự kiện đã được khôi phục thành công" });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi khôi phục sự kiện", error: error.message });
    }
};

const forceDeleteEvent = async (req, res) => {
    const { id } = req.params;
    const isOverride = req.query.isOverride === 'true';
    const userId = req.user.userId;

    try {
        if (isOverride) {
            // First check if the override exists and if the user owns the parent event
            const override = await prisma.eventOverride.findFirst({
                where: { id: parseInt(id) },
                include: { event: true }
            });
            
            if (!override) {
                return res.status(404).json({ message: "Event not found" });
            }
            
            if (override.event.userId !== parseInt(userId)) {
                return res.status(403).json({ message: "You don't have permission to delete this event" });
            }

            // Mark the override as force deleted
            await prisma.eventOverride.update({
                where: { id: parseInt(id) },
                data: { forceDelete: true }
            });
        } else {
            // Check if user owns the event
            const event = await prisma.event.findUnique({
                where: { id: parseInt(id) }
            });

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            if (event.userId !== parseInt(userId)) {
                return res.status(403).json({ message: "You don't have permission to delete this event" });
            }

            // Delete the event and all its overrides
            await prisma.event.delete({
                where: { id: parseInt(id) }
            });
        }
        res.json({ message: "Sự kiện đã được xóa vĩnh viễn" });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi xóa vĩnh viễn sự kiện", error: error.message });
    }
};

const getDeletedEvents = async (req, res) => {
  const { userId } = req.user;

  try {
    const events = await prisma.event.findMany({
      where: {
        userId: parseInt(userId),
        deletedAt: { not: null }
      }
    });

    const overrideEvents = await prisma.eventOverride.findMany({
      where: {
        deletedAt: { not: null },
        forceDelete: false,
        event: {
          userId: parseInt(userId),
        }
      }
    });

    const allEvents = events.concat(overrideEvents);

    const processedEvents = allEvents.map(event => ({
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      deletedAt: event.deletedAt.toISOString(),
      isOverride: !!event.eventId,
    }));

    res.json(processedEvents);
  } catch (error) {
    res.status(400).json({ message: "Error fetching deleted events", error: error.message });
  }
};

const searchEvents = async (req, res) => {
    const { query } = req.query;
    const { userId } = req.user;

    try {
        const events = await prisma.event.findMany({
            where: {
                userId: parseInt(userId),
                title: {
                    contains: query,
                    mode: 'insensitive'
                },
                deletedAt: null
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        return res.json(events);
    } catch (error) {
        return res.status(500).json({ message: "Error searching events", error: error.message });
    }
};

module.exports = {
    createEvent,
    getEvents: getEventsForWeek,
    updateEvent,
    softDeleteEvent,
    restoreEvent,
    forceDeleteEvent,
    getEventsForWeek,
    getEventById,
    getDeletedEvents,
    searchEvents
};