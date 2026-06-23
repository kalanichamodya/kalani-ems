import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/employees';

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formError, setFormError] = useState('');

  const emptyForm = {
    employeeId: '', firstName: '', lastName: '', email: '',
    phone: '', nic: '', department: 'Sales', position: '',
    basicSalary: '', joinedDate: '', gender: 'Male'
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { headers });
      setEmployees(res.data.employees);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingEmp(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setForm({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      nic: emp.nic,
      department: emp.department,
      position: emp.position,
      basicSalary: emp.basicSalary,
      joinedDate: emp.joinedDate?.split('T')[0],
      gender: emp.gender || 'Male'
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingEmp) {
        await axios.put(`${API}/${editingEmp._id}`, form, { headers });
      } else {
        await axios.post(API, form, { headers });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = employees.filter(emp => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !deptFilter || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ['Sales', 'Tailoring', 'Cashier', 'Management', 'Security', 'Other'];

  return (
    <div className="dash-shell">
      <div className="dash-sidebar">
        <div className="dash-logo">
          <div className="dash-logo-icon">🧵</div>
          <div>
            <div className="dash-logo-text">Kalani Garment</div>
            <div className="dash-logo-sub">Sell Center</div>
          </div>
        </div>
        <nav className="dash-nav">
          <button className="dash-nav-item" onClick={() => window.location.href = '/dashboard'}>Dashboard</button>
          <button className="dash-nav-item active">Employees</button>
          <button className="dash-nav-item">Attendance</button>
          <button className="dash-nav-item">Leave</button>
          <button className="dash-nav-item">Salary</button>
        </nav>
      </div>

      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1>Employees</h1>
            <p>Manage all employee profiles</p>
          </div>
          <button className="emp-add-btn" onClick={openAddModal}>+ Add employee</button>
          <button className="emp-icon-btn" onClick={() => openEditModal(emp)}>Edit</button>
        </div>

        <div className="emp-filters">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="dash-card">
          {loading ? (
            <p className="dash-empty">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="dash-empty">No employees found.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.employeeId}</td>
                    <td>
                      <div className="dash-emp-cell">
                        <div className="dash-emp-av">
                          {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                        </div>
                        {emp.firstName} {emp.lastName}
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>Rs. {emp.basicSalary?.toLocaleString()}</td>
                    <td>
                      <span className={`dash-badge ${emp.isActive ? 'active' : 'inactive'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="emp-icon-btn" onClick={() => openEditModal(emp)}>Edit</button>
                      <button className="emp-icon-btn danger" onClick={() => handleDelete(emp._id, emp.firstName)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="emp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEmp ? 'Edit employee' : 'Add employee'}</h2>
            {formError && <div className="login-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="emp-form-grid">
                <div>
                  <label>Employee ID</label>
                  <input value={form.employeeId} onChange={(e) => setForm({...form, employeeId: e.target.value})} required disabled={!!editingEmp} />
                </div>
                <div>
                  <label>Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label>First name</label>
                  <input value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required />
                </div>
                <div>
                  <label>Last name</label>
                  <input value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                </div>
                <div>
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
                </div>
                <div>
                  <label>NIC</label>
                  <input value={form.nic} onChange={(e) => setForm({...form, nic: e.target.value})} required />
                </div>
                <div>
                  <label>Department</label>
                  <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})}>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label>Position</label>
                  <input value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} required />
                </div>
                <div>
                  <label>Basic salary</label>
                  <input type="number" value={form.basicSalary} onChange={(e) => setForm({...form, basicSalary: e.target.value})} required />
                </div>
                <div>
                  <label>Joined date</label>
                  <input type="date" value={form.joinedDate} onChange={(e) => setForm({...form, joinedDate: e.target.value})} required />
                </div>
              </div>
              <div className="emp-modal-actions">
                <button type="button" className="emp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="emp-save-btn">{editingEmp ? 'Update' : 'Add'} employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}