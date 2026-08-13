import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Event CRUD routes
router.post('/events', authenticateUser, eventController.createEvent);
router.get('/events', authenticateUser, eventController.listEvents);
router.get('/events/range', authenticateUser, eventController.getEventsByDateRange);
router.get('/events/:id', authenticateUser, eventController.getEvent);
router.put('/events/:id', authenticateUser, eventController.updateEvent);
router.delete('/events/:id', authenticateUser, eventController.deleteEvent);

export default router;
