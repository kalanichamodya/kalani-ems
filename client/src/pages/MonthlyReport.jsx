import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EMP_API = 'http://localhost:5000/api/employees';
const ATT_API = 'http://localhost:5000/api/attendance';

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

export default function MonthlyReport() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmp) fetchMonthly();
  }, [selectedEmp, year, month]);

  const fetchEmployees = async () => {
    const res = await axios.get(EMP_API, { headers });
    setEmployees(res.data.employees);
    if (res.data.employees.length > 0) {
      setSelectedEmp(res.data.employees[0]._id);
    }
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${ATT_API}/monthly/${selectedEmp}/${year}/${month}`,
        { headers }
      );
      setRecords(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const getRecordForDay = (day) => {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return records.find(r => r.date === dateStr);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const presentDays = records.filter(r => r.status === 'Present').length;
  const lateDays = records.filter(r => r.status === 'Late').length;
  const absentDays = records.filter(r => r.status === 'Absent').length;

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const statusClass = (status) => {
    if (!status) return 'cal-empty';
    if (status === 'Present') return 'cal-present';
    if (status === 'Late') return 'cal-late';
    if (status === 'Absent') return 'cal-absent';
    return 'cal-empty';
  };
  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

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
          <button className="dash-nav-item" onClick={() => window.location.href = '/attendance'}>Attendance</button>
          <button className="dash-nav-item active">Monthly report</button>
          <button className="dash-nav-item">Leave</button>
          <button className="dash-nav-item">Salary</button>
        </nav>
      </div>

      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1>Monthly attendance report</h1>
            <p>Calendar view per employee</p>
          </div>
        </div>

        <div className="report-filters">
          <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.employeeId})
              </option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

<div className="dash-stats">
  <div className="dash-stat stat-green">
    <div className="dash-stat-label">Present days</div>
    <div className="dash-stat-val">{presentDays}</div>
  </div>
  <div className="dash-stat stat-amber">
    <div className="dash-stat-label">Late days</div>
    <div className="dash-stat-val">{lateDays}</div>
  </div>
  <div className="dash-stat stat-red">
    <div className="dash-stat-label">Absent days</div>
    <div className="dash-stat-val">{absentDays}</div>
  </div>
  <div className="dash-stat stat-blue">
    <div className="dash-stat-label">Attendance rate</div>
    <div className="dash-stat-val">
      {daysInMonth > 0 ? Math.round((presentDays + lateDays) / daysInMonth * 100) : 0}%
    </div>
  </div>
</div>

        <div className="dash-card">
            {!loading && records.length === 0 && (
  <div className="cal-no-data">
    No attendance records for this month yet.
  </div>
)}
          {loading ? (
            <p className="dash-empty">Loading...</p>
          ) : (
            <>
              <div className="cal-weekdays">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="cal-weekday">{d}</div>
                ))}
              </div>
              <div className="cal-grid">
                {calendarCells.map((day, i) => {
                  if (!day) return <div key={i} className="cal-cell cal-blank"></div>;
                  const record = getRecordForDay(day);
                  return (
                    <div key={i} className={`cal-cell ${statusClass(record?.status)} ${isToday(day) ? 'cal-today' : ''}`}>
                        <div className="cal-day-num">{day}</div>
                        {record && <div className="cal-status-dot"></div>}
                    </div>
                 );
                })}
              </div>
              <div className="cal-legend">
                <span><span className="cal-dot present"></span> Present</span>
                <span><span className="cal-dot late"></span> Late</span>
                <span><span className="cal-dot absent"></span> Absent</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}