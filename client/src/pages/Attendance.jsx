import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EMP_API = 'http://localhost:5000/api/employees';
const ATT_API = 'http://localhost:5000/api/attendance';

export default function Attendance() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get(EMP_API, { headers }),
        axios.get(`${ATT_API}?date=${date}`, { headers })
      ]);
      setEmployees(empRes.data.employees);
      setRecords(attRes.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const getRecordFor = (empId) =>
    records.find(r => r.employee?._id === empId);

  const markAttendance = async (empId, status) => {
    try {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      await axios.post(`${ATT_API}/mark`, {
        employeeId: empId,
        date,
        status,
        checkIn: status === 'Present' || status === 'Late' ? now : null
      }, { headers });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

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
          <button className="dash-nav-item" onClick={() => window.location.href = '/employees'}>Employees</button>
          <button className="dash-nav-item active">Attendance</button>
          <button className="dash-nav-item" onClick={() => window.location.href = '/monthly-report'}>Monthly report</button>
          <button className="dash-nav-item">Leave</button>
          <button className="dash-nav-item">Salary</button>
        </nav>
      </div>

      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1>Attendance</h1>
            <p>Daily attendance tracking</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="att-date-picker"
          />
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-label">Present</div>
            <div className="dash-stat-val">{presentCount}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Late</div>
            <div className="dash-stat-val">{lateCount}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Absent</div>
            <div className="dash-stat-val">{absentCount}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Total staff</div>
            <div className="dash-stat-val">{employees.length}</div>
          </div>
        </div>

        <div className="dash-card">
          {loading ? (
            <p className="dash-empty">Loading...</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Check-in</th>
                  <th>Status</th>
                  <th>Mark attendance</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const record = getRecordFor(emp._id);
                  return (
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
                      <td>{record?.checkIn || '-'}</td>
                      <td>
                        {record ? (
                          <span className={`att-badge ${record.status.toLowerCase().replace(' ', '-')}`}>
                            {record.status}
                          </span>
                        ) : (
                          <span className="att-badge not-marked">Not marked</span>
                        )}
                      </td>
                      <td>
                        <button className="att-btn present" onClick={() => markAttendance(emp._id, 'Present')}>Present</button>
                        <button className="att-btn late" onClick={() => markAttendance(emp._id, 'Late')}>Late</button>
                        <button className="att-btn absent" onClick={() => markAttendance(emp._id, 'Absent')}>Absent</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}