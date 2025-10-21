import { Bill } from '../models/Bill.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { generateInvoicePdf } from '../utils/pdf.js';

const compute = (items, taxPercent) => {
	const subtotal = items.reduce((s, it) => s + (it.amount ?? it.quantity * it.unitPrice), 0);
	const taxAmount = Math.round((subtotal * taxPercent) / 100);
	const total = subtotal + taxAmount;
	return { subtotal, taxAmount, total };
};

export const createBill = async (req, res, next) => {
	try {
		const { patient, doctor, appointment, items = [], taxPercent = 18, currency = 'INR' } = req.body;
		const [pat, doc] = await Promise.all([Patient.findById(patient), doctor ? Doctor.findById(doctor) : null]);
		if (!pat) return res.status(404).json({ message: 'Patient not found' });
		items.forEach((it) => {
			if (it.amount == null) it.amount = (it.quantity ?? 1) * it.unitPrice;
		});
		const { subtotal, taxAmount, total } = compute(items, taxPercent);
		let bill = await Bill.create({ patient, doctor, appointment, items, taxPercent, subtotal, taxAmount, total, currency });
		bill = await bill.populate('patient doctor');
		const uploaded = await generateInvoicePdf(bill);
		bill.pdfUrl = uploaded.url;
		bill.pdfPublicId = uploaded.publicId;
		await bill.save();
		res.status(201).json(bill);
	} catch (err) {
		next(err);
	}
};

export const markPaid = async (req, res, next) => {
	try {
		const { id } = req.params;
		const bill = await Bill.findByIdAndUpdate(id, { status: 'Paid' }, { new: true });
		if (!bill) return res.status(404).json({ message: 'Bill not found' });
		res.json(bill);
	} catch (err) {
		next(err);
	}
};

export const listBills = async (req, res, next) => {
	try {
		const { patient } = req.query;
		const filter = {};
		if (patient) filter.patient = patient;
		const bills = await Bill.find(filter).populate('patient doctor').sort({ createdAt: -1 });
		res.json(bills);
	} catch (err) {
		next(err);
	}
};

