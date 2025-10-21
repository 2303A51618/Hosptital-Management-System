import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listRooms, createRoom, updateRoom, deleteRoom, assignPatient, releasePatient, getRoomDetails, markCleaning, addRoomNote, addRoomCommunication, reportMaintenance, printRoomReport } from '../controllers/room.controller.js';

const router = Router();
router.get('/:id/details', protect, getRoomDetails);
router.post('/:id/clean', protect, authorize('Admin', 'Receptionist', 'Nurse'), markCleaning);
router.post('/:id/note', protect, authorize('Admin', 'Doctor', 'Nurse'), addRoomNote);
router.post('/:id/communication', protect, authorize('Admin', 'Doctor', 'Nurse'), addRoomCommunication);
router.post('/:id/maintenance', protect, authorize('Admin', 'Receptionist', 'Nurse'), reportMaintenance);
router.get('/:id/report', protect, printRoomReport);

router.get('/', protect, listRooms);
router.post('/', protect, authorize('Admin'), [body('number').notEmpty(), body('type').isIn(['AC', 'Non-AC'])], validate, createRoom);
router.put('/:id', protect, authorize('Admin'), [param('id').isMongoId()], validate, updateRoom);
router.delete('/:id', protect, authorize('Admin'), [param('id').isMongoId()], validate, deleteRoom);
router.post('/:roomId/assign', protect, authorize('Admin', 'Receptionist'), [param('roomId').isMongoId(), body('patientId').isMongoId()], validate, assignPatient);
router.post('/:roomId/release', protect, authorize('Admin', 'Receptionist'), [param('roomId').isMongoId()], validate, releasePatient);
export default router;
