const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const records = await Attendance.find(filter)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/mark', protect, async (req, res) => {
  try {
    const { employeeId, date, status, checkIn } = req.body;
    const existing = await Attendance.findOne({ employee: employeeId, date });
    if (existing) {
      existing.status = status;
      existing.checkIn = checkIn || existing.checkIn;
      await existing.save();
      return res.json(existing);
    }
    const record = await Attendance.create({
      employee: employeeId, date, status, checkIn
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/checkout', protect, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { checkOut: req.body.checkOut },
      { new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
router.get('/monthly/:employeeId/:year/:month', protect, async (req, res) => {
  try {
    const { employeeId, year, month } = req.params;
    const monthStr = month.padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});