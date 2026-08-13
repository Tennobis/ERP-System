import { Router } from 'express';
import { clientController } from '../controllers/clientController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Create a new client
router.post('/:userId', authenticateUser, clientController.createClient);

// Get all clients (irrespective of who created them)
router.get('/', authenticateUser, clientController.getAllClients);

// Get clients created by the authenticated user
router.get('/:userId', authenticateUser, clientController.getClientsByUser);

// Get a specific client by ID
router.get('/:id', authenticateUser, clientController.getClientById);

// Update a client
router.put('/:id', authenticateUser, clientController.updateClient);

// Delete a client
router.delete('/:id', authenticateUser, clientController.deleteClient);

export default router;