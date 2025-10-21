import { NurseShift } from '../models/NurseShift.js';

export const listShifts = async (req, res, next) => {
	try {
		const { from, to } = req.query;
		const filter = {};
		if (from || to) {
			filter.$and = [];
			if (from) filter.$and.push({ end: { $gte: new Date(from) } });
			if (to) filter.$and.push({ start: { $lte: new Date(to) } });
		}
		const list = await NurseShift.find(filter).sort({ start: 1 });
		res.json(list);
	} catch (err) {
		next(err);
	}
};

export const createShift = async (req, res, next) => {
	try {
		const s = await NurseShift.create(req.body);
		res.status(201).json(s);
	} catch (err) {
		next(err);
	}
};

export const updateShift = async (req, res, next) => {
	try {
		const { id } = req.params;
		const s = await NurseShift.findByIdAndUpdate(id, req.body, { new: true });
		if (!s) return res.status(404).json({ message: 'Shift not found' });
		res.json(s);
	} catch (err) {
		next(err);
	}
};

export const deleteShift = async (req, res, next) => {
	try {
		const { id } = req.params;
		const s = await NurseShift.findByIdAndDelete(id);
		if (!s) return res.status(404).json({ message: 'Shift not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

