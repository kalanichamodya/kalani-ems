import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api/employees';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEmployees(res.data.employees);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const departments = [...new Set(employees.map(e => e.department))];

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
          <button className="dash-nav-item active">Dashboard</button>
          <button className="dash-nav-item" onClick={() => window.location.href = '/employees'}>Employees</button>
          <button className="dash-nav-item">Attendance</button>
          <button className="dash-nav-item">Leave</button>
          <button className="dash-nav-item">Salary</button>
        </nav>
        <div className="dash-user">
          <div className="dash-avatar">{user?.name?.charAt(0)}</div>
          <div>
            <div className="dash-user-name">{user?.name}</div>
            <div className="dash-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="dash-logout" onClick={logout}>Logout</button>
      </div>

      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Kalani Garment Sell Center</p>
          </div>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-label">Total employees</div>
            <div className="dash-stat-val">{employees.length}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Active</div>
            <div className="dash-stat-val">{employees.filter(e => e.isActive).length}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Departments</div>
            <div className="dash-stat-val">{departments.length}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Monthly payroll</div>
            <div className="dash-stat-val">
              Rs. {employees.reduce((sum, e) => sum + (e.basicSalary || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Employees</h3>
          </div>
          {loading ? (
            <p className="dash-empty">Loading...</p>
          ) : employees.length === 0 ? (
            <p className="dash-empty">No employees yet.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}