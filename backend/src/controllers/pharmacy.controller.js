import { PharmacyItem } from '../models/PharmacyItem.js';

export const listItems = async (req, res, next) => {
	try {
		const { q } = req.query;
		const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
		const items = await PharmacyItem.find(filter).sort({ name: 1 });
		res.json(items);
	} catch (err) {
		next(err);
	}
};

export const createItem = async (req, res, next) => {
	try {
		const item = await PharmacyItem.create(req.body);
		res.status(201).json(item);
	} catch (err) {
		next(err);
	}
};

export const updateItem = async (req, res, next) => {
	try {
		const { id } = req.params;
		const item = await PharmacyItem.findByIdAndUpdate(id, req.body, { new: true });
		if (!item) return res.status(404).json({ message: 'Item not found' });
		res.json(item);
	} catch (err) {
		next(err);
	}
};

export const deleteItem = async (req, res, next) => {
	try {
		const { id } = req.params;
		const item = await PharmacyItem.findByIdAndDelete(id);
		if (!item) return res.status(404).json({ message: 'Item not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
};

