import { Ambulance } from '../models/Ambulance.js';

export const listAmbulances = async (req, res, next) => {
	try {
		const list = await Ambulance.find().sort({ vehicleNumber: 1 });
		res.json(list);
	} catch (err) {
		next(err);
	}
};

export const createAmbulance = async (req, res, next) => {
	try {
		const a = await Ambulance.create(req.body);
		res.status(201).json(a);
	} catch (err) {
		next(err);
	}
};

export const updateAmbulance = async (req, res, next) => {
	try {
		const { id } = req.params;
		const a = await Ambulance.findByIdAndUpdate(id, req.body, { new: true });
		if (!a) return res.status(404).json({ message: 'Ambulance not found' });
		res.json(a);
	} catch (err) {
		next(err);
	}
};

