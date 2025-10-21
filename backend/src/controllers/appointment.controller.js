import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { Room } from '../models/Room.js';
import { sendMail } from '../utils/mailer.js';
import { sendSMS } from '../utils/smsService.js';
import { getIO } from '../utils/socket.js';

const overlaps = (startA, endA, startB, endB) => startA < endB && startB < endA;

export const listAppointments = async (req, res, next) => {
	try {
		const { doctor, room, from, to } = req.query;
		const filter = {};
		if (doctor) filter.doctor = doctor;
		if (room) filter.room = room;
		if (from || to) {
			filter.$and = [];
			if (from) filter.$and.push({ end: { $gte: new Date(from) } });
			if (to) filter.$and.push({ start: { $lte: new Date(to) } });
		}
		const list = await Appointment.find(filter).populate('doctor patient room').sort({ start: 1 });
		res.json(list);
	} catch (err) {
		next(err);
	}
};

export const createAppointment = async (req, res, next) => {
	try {
		const { doctor, patient, room, start, end, notes } = req.body;
		const [doc, pat, rm] = await Promise.all([
			Doctor.findById(doctor),
			Patient.findById(patient),
			room ? Room.findById(room) : Promise.resolve(null),
		]);
		if (!doc || !pat) return res.status(404).json({ message: 'Doctor or patient not found' });
		const s = new Date(start);
		const e = new Date(end);
		if (s >= e) return res.status(400).json({ message: 'Invalid time range' });
		// Conflict detection for doctor
		const docConflicts = await Appointment.find({ doctor: doc._id, start: { $lt: e }, end: { $gt: s } });
		if (docConflicts.length) return res.status(409).json({ message: 'Doctor already booked in this slot' });
		// Conflict detection for room
		if (rm) {
			const roomConflicts = await Appointment.find({ room: rm._id, start: { $lt: e }, end: { $gt: s } });
			if (roomConflicts.length) return res.status(409).json({ message: 'Room already booked in this slot' });
		}
		const appt = await Appointment.create({ doctor, patient, room, start: s, end: e, notes });
		getIO()?.emit('appointment:update', { type: 'created', apptId: appt._id });

		// Notifications
		await sendMail({
			to: pat.email,
			subject: 'Appointment Scheduled',
			html: `Your appointment with Dr. ${doc.name} is scheduled on ${new Date(start).toLocaleString()}`,
		}).catch(() => {});
		if (pat.phone) await sendSMS(pat.phone, `Appt with Dr.${doc.name} on ${new Date(start).toLocaleString()}`).catch(() => {});

		res.status(201).json(appt);
	} catch (err) {
		next(err);
	}
};

export const updateAppointment = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { doctor, room, start, end } = req.body;
		const appt = await Appointment.findById(id);
		if (!appt) return res.status(404).json({ message: 'Appointment not found' });
		const s = new Date(start ?? appt.start);
		const e = new Date(end ?? appt.end);
		const docId = doctor ?? appt.doctor;
		const roomId = room ?? appt.room;
		// Conflicts
		const docConflicts = await Appointment.find({ _id: { $ne: id }, doctor: docId, start: { $lt: e }, end: { $gt: s } });
		if (docConflicts.length) return res.status(409).json({ message: 'Doctor already booked in this slot' });
		if (roomId) {
			const roomConflicts = await Appointment.find({ _id: { $ne: id }, room: roomId, start: { $lt: e }, end: { $gt: s } });
			if (roomConflicts.length) return res.status(409).json({ message: 'Room already booked in this slot' });
		}
		appt.set({ ...req.body, start: s, end: e });
		await appt.save();
		getIO()?.emit('appointment:update', { type: 'updated', apptId: appt._id });
		res.json(appt);
	} catch (err) {
		next(err);
	}
};

export const deleteAppointment = async (req, res, next) => {
	try {
		const { id } = req.params;
		const appt = await Appointment.findByIdAndDelete(id);
		if (!appt) return res.status(404).json({ message: 'Appointment not found' });
		getIO()?.emit('appointment:update', { type: 'deleted', apptId: id });
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

