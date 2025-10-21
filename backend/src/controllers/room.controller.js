// Get full room details with all advanced fields
export const getRoomDetails = async (req, res, next) => {
	try {
		const { id } = req.params;
		const room = await Room.findById(id)
			.populate('currentPatient')
			.populate('assignmentHistory.patient')
			.populate('assignmentHistory.doctor')
			.populate('assignmentHistory.nurse')
			.populate('notes.staff')
			.populate('communication.from')
			.populate('communication.to');
		if (!room) return res.status(404).json({ message: 'Room not found' });
		res.json(room);
	} catch (err) {
		next(err);
	}
};

// Mark cleaning for a room
export const markCleaning = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { staffId, notes } = req.body;
		const room = await Room.findById(id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		room.cleaningLog.push({ cleanedAt: new Date(), staff: staffId, notes });
		room.lastCleaned = new Date();
		room.cleaningRequired = false;
		await room.save();
		res.json(room);
	} catch (err) {
		next(err);
	}
};

// Add staff note to room
export const addRoomNote = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { staffId, note } = req.body;
		const room = await Room.findById(id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		room.notes.push({ staff: staffId, note, createdAt: new Date() });
		await room.save();
		res.json(room);
	} catch (err) {
		next(err);
	}
};

// Add internal communication to room
export const addRoomCommunication = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { fromId, toId, message } = req.body;
		const room = await Room.findById(id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		room.communication.push({ from: fromId, to: toId, message, createdAt: new Date() });
		await room.save();
		res.json(room);
	} catch (err) {
		next(err);
	}
};

// Report maintenance issue
export const reportMaintenance = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { issue, staffId } = req.body;
		const room = await Room.findById(id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		room.notes.push({ staff: staffId, note: `Maintenance: ${issue}`, createdAt: new Date() });
		await room.save();
		res.json(room);
	} catch (err) {
		next(err);
	}
};

// Print room details report (returns JSON for now)
export const printRoomReport = async (req, res, next) => {
	try {
		const { id } = req.params;
		const room = await Room.findById(id)
			.populate('currentPatient')
			.populate('assignmentHistory.patient')
			.populate('assignmentHistory.doctor')
			.populate('assignmentHistory.nurse');
		if (!room) return res.status(404).json({ message: 'Room not found' });
		res.json(room); // Replace with PDF generation if needed
	} catch (err) {
		next(err);
	}
};
import { Room } from '../models/Room.js';
import { Patient } from '../models/Patient.js';
import { getIO } from '../utils/socket.js';

export const listRooms = async (req, res, next) => {
	try {
		const rooms = await Room.find().populate('currentPatient');
		res.json(rooms);
	} catch (err) {
		next(err);
	}
};

export const createRoom = async (req, res, next) => {
	try {
		const room = await Room.create(req.body);
		res.status(201).json(room);
	} catch (err) {
		next(err);
	}
};

export const updateRoom = async (req, res, next) => {
	try {
		const { id } = req.params;
		const room = await Room.findByIdAndUpdate(id, req.body, { new: true });
		if (!room) return res.status(404).json({ message: 'Room not found' });
		res.json(room);
	} catch (err) {
		next(err);
	}
};

export const deleteRoom = async (req, res, next) => {
	try {
		const { id } = req.params;
		const room = await Room.findByIdAndDelete(id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

export const assignPatient = async (req, res, next) => {
	try {
		const { roomId } = req.params;
		const { patientId } = req.body;
		const [room, patient] = await Promise.all([Room.findById(roomId), Patient.findById(patientId)]);
		if (!room || !patient) return res.status(404).json({ message: 'Room or patient not found' });
		if (room.occupied) return res.status(409).json({ message: 'Room already occupied' });
		room.occupied = true;
		room.currentPatient = patient._id;
		await room.save();
		getIO()?.emit('room:update', { roomId: room._id, occupied: true, patient: { id: patient._id, name: patient.name } });
		res.json(room);
	} catch (err) {
		next(err);
	}
};

export const releasePatient = async (req, res, next) => {
	try {
		const { roomId } = req.params;
		const room = await Room.findById(roomId);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		room.occupied = false;
		room.currentPatient = null;
		await room.save();
		getIO()?.emit('room:update', { roomId: room._id, occupied: false });
		res.json(room);
	} catch (err) {
		next(err);
	}
};

