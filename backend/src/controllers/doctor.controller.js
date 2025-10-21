export const getDoctorCount = async (req, res, next) => {
  try {
    const count = await Doctor.countDocuments();
    res.json({ count });
  } catch (err) {
    next(err);
  }
};
import { Doctor } from '../models/Doctor.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

export const listDoctors = async (req, res, next) => {
  try {
    const { specialty, q } = req.query;
    const filter = {};
    if (specialty) filter.specialty = specialty;
    if (q) filter.name = { $regex: q, $options: 'i' };
    const docs = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const payload = req.body;
    const doc = await Doctor.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Doctor.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    if (doc.image?.publicId) await deleteFromCloudinary(doc.image.publicId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
