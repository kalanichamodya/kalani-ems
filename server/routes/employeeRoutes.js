const router = require('express').Router();
const Employee = require('../models/Employee');
const { protect, adminOnly, managerOrAdmin } = require('../middleware/authMiddleware');

// GET all employees — protected
router.get('/', protect, async (req, res) => {
  try {
    const { department, search, isActive } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json({ count: employees.length, employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one employee
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create employee — admin/manager only
router.post('/', protect, managerOrAdmin, async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update employee
router.put('/:id', protect, managerOrAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE employee — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;