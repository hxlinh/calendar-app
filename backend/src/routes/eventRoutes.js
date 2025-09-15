const express = require('express');
const router = express.Router();
const auth = require('../app/middlewares/authMiddleware');
const { createEvent, getEvents, updateEvent, softDeleteEvent, restoreEvent, forceDeleteEvent, getEventsForWeek, getEventById, getDeletedEvents, searchEvents } = require('../app/controllers/eventController');

router.use(auth);
router.get('/', getEventsForWeek);
router.get('/deleted', getDeletedEvents);
router.get('/:id', getEventById);
router.post('/create', createEvent);
router.put('/update/:id', updateEvent);
router.delete('/delete/:id', softDeleteEvent);
router.patch('/restore/:id', restoreEvent);
router.delete('/force/:id', forceDeleteEvent);
router.get('/all-events', getEvents);
router.get('/search', searchEvents);

module.exports = router;