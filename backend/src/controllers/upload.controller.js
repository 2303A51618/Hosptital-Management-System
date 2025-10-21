import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';

export const uploadFile = async (req, res, next) => {
	try {
		if (!req.file?.path) return res.status(400).json({ message: 'File required' });
		const up = await uploadToCloudinary(req.file.path, 'hms/uploads');
		await fs.promises.unlink(req.file.path).catch(() => {});
		res.status(201).json(up);
	} catch (err) {
		next(err);
	}
};

