export const getPatientCount = async (req, res, next) => {
	try {
		const count = await Patient.countDocuments();
		res.json({ count });
	} catch (err) {
		next(err);
	}
};
import { Patient } from '../models/Patient.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';

export const listPatients = async (req, res, next) => {
	try {
		const { q, gender, page = 1, limit = 20 } = req.query;
		const filter = {};
		if (q) {
			filter.$or = [
				{ name: { $regex: q, $options: 'i' } },
				{ email: { $regex: q, $options: 'i' } },
				{ phone: { $regex: q, $options: 'i' } },
				{ aadhaar: { $regex: q, $options: 'i' } },
			];
		}
		if (gender) filter.gender = gender;
		const skip = (Number(page) - 1) * Number(limit);
		const [items, total] = await Promise.all([
			Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
			Patient.countDocuments(filter),
		]);
		res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
	} catch (err) {
		next(err);
	}
};

export const getPatientDetails = async (req, res, next) => {
	try {
		const { id } = req.params;
		const p = await Patient.findById(id)
			.populate('assignedDoctor', 'name specialty')
			.populate('room', 'number type');
		if (!p) return res.status(404).json({ message: 'Patient not found' });
		res.json(p);
	} catch (err) {
		next(err);
	}
};

export const createPatient = async (req, res, next) => {
	try {
		const p = await Patient.create(req.body);
		res.status(201).json(p);
	} catch (err) {
		next(err);
	}
};

export const updatePatient = async (req, res, next) => {
	try {
		const { id } = req.params;
		const p = await Patient.findByIdAndUpdate(id, req.body, { new: true });
		if (!p) return res.status(404).json({ message: 'Patient not found' });
		res.json(p);
	} catch (err) {
		next(err);
	}
};

export const deletePatient = async (req, res, next) => {
	try {
		const { id } = req.params;
		const p = await Patient.findByIdAndDelete(id);
		if (!p) return res.status(404).json({ message: 'Patient not found' });
		for (const r of p.reports || []) {
			if (r.publicId) await deleteFromCloudinary(r.publicId);
		}
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

export const uploadReport = async (req, res, next) => {
	try {
		const { id } = req.params;
		const p = await Patient.findById(id);
		if (!p) return res.status(404).json({ message: 'Patient not found' });
		if (!req.file?.path) return res.status(400).json({ message: 'File required' });
		const up = await uploadToCloudinary(req.file.path, 'hms/reports');
		await fs.promises.unlink(req.file.path).catch(() => {});
		const report = { name: req.body.name || req.file.originalname, type: req.file.mimetype, url: up.url, publicId: up.publicId };
		p.reports.push(report);
		await p.save();
		res.status(201).json(report);
	} catch (err) {
		next(err);
	}
};

