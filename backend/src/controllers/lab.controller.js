import { LabTest } from '../models/LabTest.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';

export const listLabTests = async (req, res, next) => {
	try {
		const { patient } = req.query;
		const filter = patient ? { patient } : {};
		const tests = await LabTest.find(filter).populate('patient doctor').sort({ createdAt: -1 });
		res.json(tests);
	} catch (err) {
		next(err);
	}
};

export const createLabTest = async (req, res, next) => {
	try {
		const test = await LabTest.create(req.body);
		res.status(201).json(test);
	} catch (err) {
		next(err);
	}
};

export const uploadResult = async (req, res, next) => {
	try {
		const { id } = req.params;
		const lt = await LabTest.findById(id);
		if (!lt) return res.status(404).json({ message: 'Lab test not found' });
		if (!req.file?.path) return res.status(400).json({ message: 'File required' });
		const up = await uploadToCloudinary(req.file.path, 'hms/lab-results');
		await fs.promises.unlink(req.file.path).catch(() => {});
		lt.resultUrl = up.url;
		lt.resultPublicId = up.publicId;
		lt.status = 'Completed';
		await lt.save();
		res.json(lt);
	} catch (err) {
		next(err);
	}
};

