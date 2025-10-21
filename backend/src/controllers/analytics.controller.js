import { Appointment } from '../models/Appointment.js';
import { Bill } from '../models/Bill.js';
import { Room } from '../models/Room.js';
import { Patient } from '../models/Patient.js';

export const getMetrics = async (req, res, next) => {
	try {
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const [apptCount, revenueAgg, rooms] = await Promise.all([
			Appointment.countDocuments({ start: { $gte: monthStart } }),
			Bill.aggregate([
				{ $match: { createdAt: { $gte: monthStart }, status: { $in: ['Paid', 'Pending'] } } },
				{ $group: { _id: null, total: { $sum: '$total' } } },
			]),
			Room.find(),
		]);
		const revenue = revenueAgg[0]?.total || 0;
		const occupancy = rooms.length ? Math.round((rooms.filter((r) => r.occupied).length / rooms.length) * 100) : 0;
		res.json({ apptCount, revenue, occupancy });
	} catch (err) {
		next(err);
	}
};

export const getRecentActivities = async (req, res, next) => {
	try {
		const recentPatients = await Patient.find()
			.sort({ createdAt: -1 })
			.limit(10)
			.select('name admissionStatus createdAt room');
		
		const activities = recentPatients.map(p => ({
			type: p.admissionStatus === 'Admitted' ? 'admission' : p.admissionStatus === 'Discharged' ? 'discharge' : 'registration',
			patient: p.name,
			details: p.room ? `Room ${p.room}` : 'Pending room assignment',
			time: p.createdAt
		}));
		
		res.json(activities);
	} catch (err) {
		next(err);
	}
};

export const getChartData = async (req, res, next) => {
	try {
		const now = new Date();
		const last7Days = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			last7Days.push(date);
		}
		
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		
		// Revenue data
		const revenueData = await Promise.all(
			last7Days.map(async (date) => {
				const nextDay = new Date(date);
				nextDay.setDate(nextDay.getDate() + 1);
				const bills = await Bill.aggregate([
					{ $match: { createdAt: { $gte: date, $lt: nextDay }, status: { $in: ['Paid', 'Pending'] } } },
					{ $group: { _id: null, total: { $sum: '$total' } } }
				]);
				return {
					day: days[date.getDay()],
					revenue: bills[0]?.total || 0
				};
			})
		);
		
		// Appointments data
		const appointmentsData = await Promise.all(
			last7Days.map(async (date) => {
				const nextDay = new Date(date);
				nextDay.setDate(nextDay.getDate() + 1);
				const count = await Appointment.countDocuments({
					start: { $gte: date, $lt: nextDay }
				});
				return {
					day: days[date.getDay()],
					count
				};
			})
		);
		
		res.json({
			revenue: revenueData,
			appointments: appointmentsData,
			occupancy: []
		});
	} catch (err) {
		next(err);
	}
};

