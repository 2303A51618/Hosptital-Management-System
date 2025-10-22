import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { listRooms, createRoom, updateRoom, deleteRoom, assignPatient, releasePatient, getRoomDetails, markCleaning, addRoomNote, addRoomCommunication, reportMaintenance, printRoomReport } from '../controllers/room.controller.js';

const router = Router();
router.get('/:id/details', getRoomDetails);
router.post('/:id/clean', markCleaning);
router.post('/:id/note', addRoomNote);
router.post('/:id/communication', addRoomCommunication);
router.post('/:id/maintenance', reportMaintenance);
router.get('/:id/report', printRoomReport);

router.get('/', listRooms);
router.post('/', [body('number').notEmpty(), body('type').isIn(['AC', 'Non-AC'])], validate, createRoom);
router.put('/:id', [param('id').isMongoId()], validate, updateRoom);
router.delete('/:id', [param('id').isMongoId()], validate, deleteRoom);
router.post('/:roomId/assign', [param('roomId').isMongoId(), body('patientId').isMongoId()], validate, assignPatient);
router.post('/:roomId/release', [param('roomId').isMongoId()], validate, releasePatient);
export default router;
