import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout";

const roleHomePath = (role) => (role === "employee" ? "/employee/report" : `/${role}/dashboard`);
const API_BASE = "http://127.0.0.1:5000/api";

async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || "Request failed");
  }
  return body;
}

function LoginPage({ onLogin, onToken }) {
  const [form, setForm] = useState({ role: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ role: "", username: "", password: "" });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch("/auth/login", null, {
        method: "POST",
        body: JSON.stringify({
          role: form.role,
          username: form.username.trim(),
          password: form.password
        })
      });
      onToken(result.token);
      onLogin(result.user);
    } catch (err) {
      setError(err.message || "Invalid credentials for selected role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card login-card-v2" onSubmit={submit} autoComplete="off">
        <div className="login-v2-head">
          <h1>Attrition Analysis System</h1>
          <p>Secure role-based access portal</p>
        </div>

        <div className="role-tiles">
          {["admin", "hr", "employee"].map((role) => (
            <button
              type="button"
              key={role}
              className={`role-tile ${form.role === role ? "active" : ""}`}
              onClick={() => setForm({ ...form, role })}
            >
              {role.toUpperCase()}
            </button>
          ))}
        </div>

        <label>Username</label>
        <input
          autoComplete="off"
          name="attrition-username"
          placeholder="Enter username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />

        <label>Password</label>
        <input
          type="password"
          autoComplete="new-password"
          name="attrition-password"
          placeholder="Enter password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button type="submit" disabled={loading || !form.role}>
          {loading ? "Signing in..." : "Login"}
        </button>
        {error && <p className="error">{error}</p>}

        <div className="login-help">Demo: admin/admin123, admin2/admin@123, hr/hr123, employee/emp123</div>
      </form>
    </div>
  );
}

function AnalyticsDashboard({ analytics, loading, error }) {
  const kpi = analytics?.kpi || {};
  const rows = analytics?.high_risk_table || [];
  const chartRows = rows.slice(0, 6);

  if (loading) return <div className="panel">Loading analytics...</div>;
  if (error) return <div className="panel">Failed to load analytics: {error}</div>;

  return (
    <>
      <div className="kpis">
        <div className="card"><small>Total Employees</small><h3>{kpi.total_employees ?? "-"}</h3></div>
        <div className="card"><small>Attrition Rate</small><h3>{kpi.attrition_rate ?? "-"}%</h3></div>
        <div className="card"><small>High Risk</small><h3>{kpi.high_risk_employees ?? "-"}</h3></div>
        <div className="card"><small>Avg Satisfaction</small><h3>{kpi.average_satisfaction ?? "-"}/5</h3></div>
      </div>
      <div className="panels">
        <div className="panel chart-panel">
          <h4>Attrition by Department (YTD)</h4>
          <div className="bars">
            {chartRows.map((row, idx) => (
              <div key={`${row.id}-dept`} className="bar-item">
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${35 + (idx % 4) * 12}%` }} />
                </div>
                <small>{row.department}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel chart-panel">
          <h4>High-Risk by Job Role</h4>
          <div className="donut-placeholder">
            <div className="donut-hole">{kpi.high_risk_employees ?? "-"}</div>
          </div>
        </div>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Risk</th><th>Score</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.job_role}</td>
                <td><span className={`risk-tag risk-${String(row.risk || "").toLowerCase()}`}>{row.risk}</span></td>
                <td>{row.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EmployeeDashboard({ profile, loading, error }) {
  if (loading) return <div className="panel">Loading your dashboard...</div>;
  if (error) return <div className="panel">Failed to load dashboard: {error}</div>;

  return (
    <>
      <div className="kpis">
        <div className="card"><small>Performance Rating</small><h3>{Number(profile?.performance_rating || 0).toFixed(1)}/5</h3></div>
        <div className="card"><small>Job Satisfaction</small><h3>{profile?.job_satisfaction ?? "-"}/5</h3></div>
        <div className="card"><small>Years at Company</small><h3>{profile?.years_at_company ?? "-"}</h3></div>
        <div className="card"><small>Current Role</small><h3>{profile?.current_role ?? "-"}</h3></div>
      </div>
      <div className="panels">
        <div className="panel">
          <h4>My Profile</h4>
          <ul className="plain-list">
            <li>Employee ID: {profile?.employee_id ?? "-"}</li>
            <li>Department: {profile?.department ?? "-"}</li>
            <li>Role: {profile?.current_role ?? "-"}</li>
            <li>Manager: {profile?.manager ?? "-"}</li>
          </ul>
        </div>
        <div className="panel">
          <h4>My Performance</h4>
          <ul className="plain-list">
            <li>Current rating: {Number(profile?.performance_rating || 0).toFixed(1)} / 5</li>
            <li>Goal completion: {profile?.goals_completion ?? "-"}%</li>
            <li>Job satisfaction: {profile?.job_satisfaction ?? "-"} / 5</li>
            <li>Recommendation: {profile?.recommendation ?? "-"}</li>
          </ul>
        </div>
      </div>
      <div className="panel">
        <h4>Restricted View</h4>
        <p className="muted-text">
          Company-wide attrition charts, employee management, uploads, and reports are hidden for employee accounts.
        </p>
      </div>
    </>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function AdminUsersPage() {
  return (
    <>
      <SectionHeader
        title="User Management"
        subtitle="Create and manage login access for Admin, HR, and Employee roles."
      />
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>admin</td><td>Admin</td><td>Active</td><td>Today, 9:12 AM</td></tr>
            <tr><td>hr</td><td>HR</td><td>Active</td><td>Today, 8:46 AM</td></tr>
            <tr><td>employee</td><td>Employee</td><td>Active</td><td>Yesterday, 6:03 PM</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function HrDetailsPage({ token }) {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localSearch, setLocalSearch] = useState("");

  const loadHrUsers = (search = "") => {
    if (!token) return;
    setLoading(true);
    setError("");
    apiFetch(`/employees/hrs${search ? `?search=${encodeURIComponent(search)}` : ""}`, token)
      .then((data) => setHrs(data))
      .catch((err) => setError(err.message || "Failed to load HR details"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHrUsers();
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadHrUsers(localSearch.trim());
  };

  const handleClear = () => {
    setLocalSearch("");
    loadHrUsers("");
  };

  return (
    <>
      <SectionHeader
        title="HR Team Details"
        subtitle="Admin-only view of HR users, teams, and access details."
      />
      <div className="panel search-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search HR by ID, username, name, or team"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <div className="search-actions">
            <button type="submit">Search</button>
            <button type="button" className="secondary-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>
      </div>
      {loading ? (
        <div className="panel">Loading HR details...</div>
      ) : error ? (
        <div className="panel">Failed to load HR details: {error}</div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Team</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {hrs.map((hr) => (
                <tr key={hr.id}>
                  <td>{hr.id}</td>
                  <td>{hr.name}</td>
                  <td>{hr.username}</td>
                  <td>{hr.team}</td>
                  <td>{hr.role.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function EmployeesPage({ rows, loading, error, searchValue, onSearch }) {
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  useEffect(() => {
    setLocalSearch(searchValue || "");
  }, [searchValue]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(localSearch.trim());
  };

  const handleClear = () => {
    setLocalSearch("");
    onSearch("");
  };

  return (
    <>
      <SectionHeader
        title="Employee Directory"
        subtitle="Search employees by ID or name and review risk profiles."
      />
      <div className="panel search-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search by employee ID or name"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          <div className="search-actions">
            <button type="submit">Search</button>
            <button type="button" className="secondary-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>
      </div>
      {loading ? (
        <div className="panel">Loading employees...</div>
      ) : error ? (
        <div className="panel">Failed to load employees: {error}</div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Risk</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.department}</td>
                  <td>{row.job_role}</td>
                  <td>{row.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function downloadFile(filename, content, type = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getSettingsStorageKey(user) {
  return `attrition_settings_${user?.username || "guest"}`;
}

function MiniTrendChart({ values }) {
  const width = 320;
  const height = 140;
  const padding = 18;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mini-trend-chart" role="img" aria-label="Performance trend chart">
      <defs>
        <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(100, 227, 214, 0.35)" />
          <stop offset="100%" stopColor="rgba(100, 227, 214, 0.02)" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="rgba(100, 227, 214, 0.9)"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      {values.map((value, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="4.5" fill="#64e3d6" />;
      })}
    </svg>
  );
}

function ScoreBars({ metrics }) {
  const max = 100;
  return (
    <div className="score-bars">
      {metrics.map((metric) => (
        <div className="score-row" key={metric.label}>
          <div className="score-head">
            <span>{metric.label}</span>
            <strong>{metric.value}%</strong>
          </div>
          <div className="score-track">
            <div className="score-fill" style={{ width: `${Math.min(metric.value, max)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function toCsv(rows) {
  if (!rows.length) return "id,name,department,job_role,risk,risk_score\n";
  const header = ["id", "name", "department", "job_role", "risk", "risk_score"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => header.map((k) => esc(r[k])).join(","));
  return `${header.join(",")}\n${lines.join("\n")}`;
}

function ReportsPage({ role, rows, loading, error }) {
  if (loading) return <div className="panel">Loading reports...</div>;
  if (error) return <div className="panel">Failed to load reports: {error}</div>;

  const timestamp = new Date().toISOString().slice(0, 10);
  const base = `${role}_attrition_report_${timestamp}`;
  const previewRows = [...rows]
    .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
    .slice(0, 8);
  const highRiskCount = rows.filter((r) => String(r.risk || "").toLowerCase() === "high").length;
  const mediumRiskCount = rows.filter((r) => String(r.risk || "").toLowerCase() === "medium").length;
  const lowRiskCount = rows.length - highRiskCount - mediumRiskCount;

  const downloadMonthlyCsv = () => {
    downloadFile(`${base}_monthly_summary.csv`, toCsv(rows), "text/csv;charset=utf-8;");
  };

  const downloadDepartmentCsv = () => {
    const grouped = Object.values(
      rows.reduce((acc, row) => {
        const dept = row.department || "Unknown";
        if (!acc[dept]) acc[dept] = { department: dept, total: 0, high: 0, medium: 0, low: 0 };
        acc[dept].total += 1;
        const rk = String(row.risk || "").toLowerCase();
        if (rk === "high") acc[dept].high += 1;
        else if (rk === "medium") acc[dept].medium += 1;
        else acc[dept].low += 1;
        return acc;
      }, {})
    );
    const csv = [
      "department,total_employees,high_risk,medium_risk,low_risk",
      ...grouped.map((g) => `${g.department},${g.total},${g.high},${g.medium},${g.low}`)
    ].join("\n");
    downloadFile(`${base}_department_trends.csv`, csv, "text/csv;charset=utf-8;");
  };

  const downloadTopRiskCsv = () => {
    const top = [...rows]
      .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
      .slice(0, 50);
    downloadFile(`${base}_top_risk_employees.csv`, toCsv(top), "text/csv;charset=utf-8;");
  };

  const printReport = () => {
    window.print();
  };

  return (
    <>
      <SectionHeader
        title="Reports"
        subtitle={`Download weekly and monthly attrition reports for ${role.toUpperCase()} workflows.`}
      />
      <div className="panels">
        <div className="panel">
          <h4>Available Reports</h4>
          <ul className="plain-list">
            <li>
              Monthly Attrition Summary
              <button className="inline-download" onClick={downloadMonthlyCsv}>Download CSV</button>
            </li>
            <li>
              Department Retention Trends
              <button className="inline-download" onClick={downloadDepartmentCsv}>Download CSV</button>
            </li>
            <li>
              Top Risk Employees Snapshot
              <button className="inline-download" onClick={downloadTopRiskCsv}>Download CSV</button>
            </li>
          </ul>
        </div>
        <div className="panel">
          <h4>Export Formats</h4>
          <ul className="plain-list">
            <li>PDF (use Print / Save as PDF)</li>
            <li>CSV (direct download)</li>
            <li>Excel (open CSV in Excel)</li>
          </ul>
          <button onClick={printReport}>Print Report</button>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h4>Report Preview</h4>
        <p className="muted-text" style={{ marginTop: 0 }}>
          Snapshot from current dataset ({rows.length} employees)
        </p>
        <div className="kpis" style={{ marginBottom: 10 }}>
          <div className="card"><small>High Risk</small><h3>{highRiskCount}</h3></div>
          <div className="card"><small>Medium Risk</small><h3>{mediumRiskCount}</h3></div>
          <div className="card"><small>Low Risk</small><h3>{lowRiskCount}</h3></div>
          <div className="card"><small>Total Rows</small><h3>{rows.length}</h3></div>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Risk</th><th>Score</th></tr>
          </thead>
          <tbody>
            {previewRows.map((row) => (
              <tr key={`preview-${row.id}`}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.job_role}</td>
                <td><span className={`risk-tag risk-${String(row.risk || "").toLowerCase()}`}>{row.risk}</span></td>
                <td>{row.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HrUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage("");
    setPreview([]);

    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv")) {
      setMessage("Preview supports CSV files for now. You can still replace the file selection.");
      return;
    }

    try {
      const text = await file.text();
      const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean);
      const headers = (headerLine || "").split(",").map((col) => col.trim());
      const previewRows = rows.slice(0, 5).map((row, index) => {
        const values = row.split(",").map((value) => value.trim());
        return headers.reduce(
          (acc, header, valueIndex) => ({ ...acc, [header || `column_${valueIndex + 1}`]: values[valueIndex] ?? "" }),
          { id: `preview-${index}` }
        );
      });
      setPreview(previewRows);
      setMessage(`Loaded ${rows.length} data rows from ${file.name}.`);
    } catch {
      setMessage("Unable to read that file. Try a clean CSV export.");
    }
  };

  return (
    <>
      <SectionHeader
        title="Upload Data"
        subtitle="Upload employee records and performance data files for analysis."
      />
      <div className="panel upload-panel">
        <label>Choose dataset file (CSV/Excel)</label>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
        <p className="muted-text">Template columns: employee_id, department, job_role, satisfaction, performance_rating.</p>
        {selectedFile && (
          <div className="upload-summary">
            <strong>{selectedFile.name}</strong>
            <span>{Math.max(1, Math.round(selectedFile.size / 1024))} KB</span>
          </div>
        )}
        {message && <p className="muted-text">{message}</p>}
        {preview.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {Object.keys(preview[0])
                    .filter((key) => key !== "id")
                    .map((key) => <th key={key}>{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr key={row.id}>
                    {Object.entries(row)
                      .filter(([key]) => key !== "id")
                      .map(([key, value]) => <td key={key}>{value || "-"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function HrAnalysisPage({ rows, loading, error }) {
  if (loading) return <div className="panel">Loading analysis...</div>;
  if (error) return <div className="panel">Failed to load analysis: {error}</div>;

  const riskCounts = rows.reduce(
    (acc, row) => {
      const key = String(row.risk || "").toLowerCase();
      if (key === "high") acc.high += 1;
      else if (key === "medium") acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );
  const total = rows.length || 1;
  const highPct = Math.round((riskCounts.high / total) * 100);
  const mediumPct = Math.round((riskCounts.medium / total) * 100);
  const lowPct = Math.max(0, 100 - highPct - mediumPct);

  const deptSummary = Object.entries(
    rows.reduce((acc, row) => {
      const dept = row.department || "Unknown";
      if (!acc[dept]) acc[dept] = { total: 0, high: 0 };
      acc[dept].total += 1;
      if (String(row.risk || "").toLowerCase() === "high") acc[dept].high += 1;
      return acc;
    }, {})
  )
    .map(([department, stats]) => ({
      department,
      rate: Math.round((stats.high / stats.total) * 100),
      total: stats.total
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 6);

  return (
    <>
      <SectionHeader
        title="Analysis"
        subtitle="Review trend insights and model output for early attrition detection."
      />
      <div className="panels">
        <div className="panel chart-panel">
          <h4>Top Departments by High-Risk Rate</h4>
          <div className="bars">
            {deptSummary.map((d) => (
              <div className="bar-item" key={d.department}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${Math.max(10, d.rate)}%` }} />
                </div>
                <small>{d.department}</small>
                <small>{d.rate}%</small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel chart-panel">
          <h4>Risk Distribution</h4>
          <div className="donut-placeholder risk-donut">
            <div className="donut-hole">{rows.length}</div>
          </div>
          <div className="risk-legend">
            <span><i className="risk-dot high" />High: {highPct}%</span>
            <span><i className="risk-dot medium" />Medium: {mediumPct}%</span>
            <span><i className="risk-dot low" />Low: {lowPct}%</span>
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h4>Priority Employees (Highest Risk Score)</h4>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Risk</th><th>Score</th></tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
              .slice(0, 8)
              .map((row) => (
                <tr key={`analysis-${row.id}`}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.department}</td>
                  <td>{row.job_role}</td>
                  <td><span className={`risk-tag risk-${String(row.risk || "").toLowerCase()}`}>{row.risk}</span></td>
                  <td>{row.risk_score}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EmployeeProfilePage({ profile, loading, error }) {
  if (loading) return <div className="panel">Loading profile...</div>;
  if (error) return <div className="panel">Failed to load profile: {error}</div>;

  return (
    <>
      <SectionHeader
        title="My Profile"
        subtitle="View your core employment details and reporting manager."
      />
      <div className="panel">
        <ul className="plain-list">
          <li>Employee ID: {profile?.employee_id ?? "-"}</li>
          <li>Department: {profile?.department ?? "Sales"}</li>
          <li>Role: {profile?.current_role ?? "-"}</li>
          <li>Manager: {profile?.manager ?? "-"}</li>
        </ul>
      </div>
    </>
  );
}

function EmployeePerformancePage({ profile, loading, error }) {
  if (loading) return <div className="panel">Loading performance...</div>;
  if (error) return <div className="panel">Failed to load performance: {error}</div>;

  return (
    <>
      <SectionHeader
        title="My Performance"
        subtitle="Track your ratings, goals, and growth feedback."
      />
      <div className="kpis">
        <div className="card"><small>Current Rating</small><h3>{Number(profile?.performance_rating || 0).toFixed(1)}/5</h3></div>
        <div className="card"><small>Goal Completion</small><h3>{profile?.goals_completion ?? "-"}%</h3></div>
        <div className="card"><small>Satisfaction</small><h3>{profile?.job_satisfaction ?? "-"}/5</h3></div>
        <div className="card"><small>Recommendation</small><h3>{profile?.recommendation ?? "-"}</h3></div>
      </div>
    </>
  );
}

function EmployeeSettingsPage({ user, onLogout }) {
  const storageKey = getSettingsStorageKey(user);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return saved || {
        emailAlerts: true,
        weeklySummary: true,
        reportReadyAlerts: true,
        contactEmail: `${user?.username || "employee"}@company.com`,
        lastUpdatedDays: 23
      };
    } catch {
      return {
        emailAlerts: true,
        weeklySummary: true,
        reportReadyAlerts: true,
        contactEmail: `${user?.username || "employee"}@company.com`,
        lastUpdatedDays: 23
      };
    }
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  };

  const saveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setMessage("Settings saved successfully.");
  };

  const updatePassword = (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordMessage("Fill in all password fields.");
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    const nextSettings = { ...settings, lastUpdatedDays: 0 };
    setSettings(nextSettings);
    localStorage.setItem(storageKey, JSON.stringify(nextSettings));
    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordMessage("Password updated for this demo account.");
  };

  return (
    <>
      <SectionHeader
        title="Settings"
        subtitle="Manage alerts, report notifications, contact details, and your password."
      />
      <div className="panels">
        <form className="panel settings-form" onSubmit={saveSettings}>
          <h4>Notifications</h4>
          <label className="toggle-row">
            <span>Email alerts</span>
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => updateSetting("emailAlerts", e.target.checked)}
            />
          </label>
          <label className="toggle-row">
            <span>Weekly report summary</span>
            <input
              type="checkbox"
              checked={settings.weeklySummary}
              onChange={(e) => updateSetting("weeklySummary", e.target.checked)}
            />
          </label>
          <label className="toggle-row">
            <span>Report ready alerts</span>
            <input
              type="checkbox"
              checked={settings.reportReadyAlerts}
              onChange={(e) => updateSetting("reportReadyAlerts", e.target.checked)}
            />
          </label>
          <label>Contact email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => updateSetting("contactEmail", e.target.value)}
            placeholder="Enter notification email"
          />
          <p className="muted-text">Password last updated: {settings.lastUpdatedDays} days ago</p>
          <div className="report-actions">
            <button type="submit">Save Settings</button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                const defaults = {
                  emailAlerts: true,
                  weeklySummary: true,
                  reportReadyAlerts: true,
                  contactEmail: `${user?.username || "employee"}@company.com`,
                  lastUpdatedDays: settings.lastUpdatedDays
                };
                setSettings(defaults);
                localStorage.setItem(storageKey, JSON.stringify(defaults));
                setMessage("Settings reset to defaults.");
              }}
            >
              Reset
            </button>
          </div>
          {message ? <p className="success-text">{message}</p> : null}
        </form>

        <form className="panel settings-form" onSubmit={updatePassword}>
          <h4>Security</h4>
          <label>Current password</label>
          <input
            type="password"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
            placeholder="Enter current password"
          />
          <label>New password</label>
          <input
            type="password"
            value={passwordForm.next}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
            placeholder="Enter new password"
          />
          <label>Confirm new password</label>
          <input
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
            placeholder="Confirm new password"
          />
          <div className="report-actions">
            <button type="submit">Update Password</button>
            <button type="button" className="secondary-btn" onClick={onLogout}>
              Save And Logout
            </button>
          </div>
          {passwordMessage ? <p className="muted-text">{passwordMessage}</p> : null}
        </form>
      </div>
    </>
  );
}

function EmployeeReportPage({ profile, loading, error }) {
  if (loading) return <div className="panel">Generating your report...</div>;
  if (error) return <div className="panel">Failed to generate report: {error}</div>;

  const performanceScore = Math.round((Number(profile?.performance_rating || 0) / 5) * 100);
  const satisfactionScore = Math.round((Number(profile?.job_satisfaction || 0) / 5) * 100);
  const goalsScore = Number(profile?.goals_completion || 0);
  const tenureScore = Math.min(100, Math.round((Number(profile?.years_at_company || 0) / 10) * 100));
  const metrics = [
    { label: "Performance", value: performanceScore },
    { label: "Satisfaction", value: satisfactionScore },
    { label: "Goal Completion", value: goalsScore },
    { label: "Tenure Stability", value: tenureScore }
  ];
  const trendValues = [
    Math.max(45, performanceScore - 18),
    Math.max(52, satisfactionScore - 10),
    Math.max(58, goalsScore - 8),
    Math.max(62, performanceScore - 4),
    Math.max(68, satisfactionScore + 2),
    Math.max(72, Math.round((performanceScore + goalsScore) / 2))
  ];

  const reportText = [
    "Employee Report",
    `Employee ID: ${profile?.employee_id ?? "-"}`,
    `Role: ${profile?.current_role ?? "-"}`,
    `Department: ${profile?.department ?? "-"}`,
    `Manager: ${profile?.manager ?? "-"}`,
    `Performance Rating: ${Number(profile?.performance_rating || 0).toFixed(1)}/5`,
    `Job Satisfaction: ${profile?.job_satisfaction ?? "-"}/5`,
    `Goal Completion: ${profile?.goals_completion ?? "-"}%`,
    `Years at Company: ${profile?.years_at_company ?? "-"}`,
    `Recommendation: ${profile?.recommendation ?? "-"}`
  ].join("\n");

  return (
    <>
      <SectionHeader
        title="My Report"
        subtitle="A personal attrition and performance snapshot generated from your employee profile."
      />
      <div className="kpis">
        <div className="card"><small>Report Status</small><h3>Ready</h3></div>
        <div className="card"><small>Performance Index</small><h3>{performanceScore}%</h3></div>
        <div className="card"><small>Engagement Index</small><h3>{Math.round((satisfactionScore + goalsScore) / 2)}%</h3></div>
        <div className="card"><small>Manager Review</small><h3>{profile?.recommendation ?? "-"}</h3></div>
      </div>

      <div className="panels">
        <div className="panel chart-panel">
          <h4>Progress Trend</h4>
          <p className="muted-text chart-copy">A simple trend view using your current rating, satisfaction, and goal completion levels.</p>
          <MiniTrendChart values={trendValues} />
          <div className="trend-labels">
            <span>Month 1</span>
            <span>Month 2</span>
            <span>Month 3</span>
            <span>Month 4</span>
            <span>Month 5</span>
            <span>Month 6</span>
          </div>
        </div>
        <div className="panel chart-panel">
          <h4>Score Breakdown</h4>
          <p className="muted-text chart-copy">These bars summarize the main factors shown on your employee dashboard.</p>
          <ScoreBars metrics={metrics} />
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <h4>Report Summary</h4>
          <ul className="plain-list">
            <li>Employee ID: {profile?.employee_id ?? "-"}</li>
            <li>Department: {profile?.department ?? "-"}</li>
            <li>Current Role: {profile?.current_role ?? "-"}</li>
            <li>Reporting Manager: {profile?.manager ?? "-"}</li>
            <li>Recommendation: {profile?.recommendation ?? "-"}</li>
          </ul>
        </div>
        <div className="panel">
          <h4>Export</h4>
          <p className="muted-text chart-copy">
            Download your personal report summary or print this page as a PDF.
          </p>
          <div className="report-actions">
            <button onClick={() => downloadFile(`employee_report_${profile?.employee_id || "profile"}.txt`, reportText)}>
              Download Summary
            </button>
            <button className="secondary-btn" onClick={() => window.print()}>
              Print Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Protected({ user, allow, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (!allow.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [loading, setLoading] = useState({ analytics: false, employees: false, employee: false });
  const [errors, setErrors] = useState({ analytics: "", employees: "", employee: "" });

  useEffect(() => {
    localStorage.removeItem("attrition_react_session");
    localStorage.removeItem("attrition_react_token");
  }, []);

  const login = (u) => {
    localStorage.setItem("attrition_react_session", JSON.stringify(u));
    setErrors({ analytics: "", employees: "", employee: "" });
    setUser(u);
    navigate(roleHomePath(u.role));
  };

  const logout = () => {
    localStorage.removeItem("attrition_react_session");
    localStorage.removeItem("attrition_react_token");
    setToken("");
    setUser(null);
    setAnalytics(null);
    setEmployees([]);
    setEmployeeProfile(null);
    setEmployeeSearch("");
    setErrors({ analytics: "", employees: "", employee: "" });
  };

  const loadEmployees = (search = "") => {
    setEmployeeSearch(search);
    if (!token) return Promise.resolve([]);

    setLoading((p) => ({ ...p, employees: true }));
    setErrors((p) => ({ ...p, employees: "" }));

    return apiFetch(`/employees${search ? `?search=${encodeURIComponent(search)}` : ""}`, token)
      .then((data) => {
        setEmployees(data);
        setErrors((p) => ({ ...p, employees: "" }));
        return data;
      })
      .catch((err) => {
        setErrors((p) => ({ ...p, employees: err.message || "Failed to load employees" }));
        throw err;
      })
      .finally(() => setLoading((p) => ({ ...p, employees: false })));
  };

  useEffect(() => {
    if (!user || !token) return;
    if (user.role === "admin" || user.role === "hr") {
      setErrors((p) => ({ ...p, analytics: "", employees: "" }));
      setLoading((p) => ({ ...p, analytics: true, employees: true }));
      apiFetch("/dashboard/analytics", token)
        .then((data) => {
          setAnalytics(data);
          setErrors((p) => ({ ...p, analytics: "" }));
        })
        .catch((err) => setErrors((p) => ({ ...p, analytics: err.message || "Failed to load analytics" })))
        .finally(() => setLoading((p) => ({ ...p, analytics: false })));
      loadEmployees(employeeSearch).catch(() => {});
      return;
    }
    if (user.role === "employee") {
      setErrors((p) => ({ ...p, employee: "" }));
      setLoading((p) => ({ ...p, employee: true }));
      apiFetch("/dashboard/employee", token)
        .then((res) => {
          setEmployeeProfile(res.profile);
          setErrors((p) => ({ ...p, employee: "" }));
        })
        .catch((err) => setErrors((p) => ({ ...p, employee: err.message || "Failed to load employee profile" })))
        .finally(() => setLoading((p) => ({ ...p, employee: false })));
    }
  }, [user, token]);

  const shell = useMemo(
    () =>
      (children) =>
        user ? <Layout user={user} onLogout={logout}>{children}</Layout> : <Navigate to="/" replace />,
    [user]
  );

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to={roleHomePath(user.role)} replace /> : <LoginPage onLogin={login} onToken={(t) => {
          localStorage.setItem("attrition_react_token", t);
          setToken(t);
        }} />}
      />

      <Route path="/admin/dashboard" element={<Protected user={user} allow={["admin"]}>{shell(<AnalyticsDashboard analytics={analytics} loading={loading.analytics} error={errors.analytics} />)}</Protected>} />
      <Route path="/admin/users" element={<Protected user={user} allow={["admin"]}>{shell(<AdminUsersPage />)}</Protected>} />
      <Route path="/admin/employees" element={<Protected user={user} allow={["admin"]}>{shell(<EmployeesPage rows={employees} loading={loading.employees} error={errors.employees} searchValue={employeeSearch} onSearch={loadEmployees} />)}</Protected>} />
      <Route path="/admin/hr-details" element={<Protected user={user} allow={["admin"]}>{shell(<HrDetailsPage token={token} />)}</Protected>} />
      <Route path="/admin/reports" element={<Protected user={user} allow={["admin"]}>{shell(<ReportsPage role="admin" rows={employees} loading={loading.employees} error={errors.employees} />)}</Protected>} />
      <Route path="/admin" element={<Protected user={user} allow={["admin"]}><Navigate to="/admin/dashboard" replace /></Protected>} />
      <Route path="/admin/*" element={<Protected user={user} allow={["admin"]}><Navigate to="/admin/dashboard" replace /></Protected>} />

      <Route path="/hr/dashboard" element={<Protected user={user} allow={["hr", "admin"]}>{shell(<AnalyticsDashboard analytics={analytics} loading={loading.analytics} error={errors.analytics} />)}</Protected>} />
      <Route path="/hr/employees" element={<Protected user={user} allow={["hr", "admin"]}>{shell(<EmployeesPage rows={employees} loading={loading.employees} error={errors.employees} searchValue={employeeSearch} onSearch={loadEmployees} />)}</Protected>} />
      <Route path="/hr/upload" element={<Protected user={user} allow={["hr", "admin"]}>{shell(<HrUploadPage />)}</Protected>} />
      <Route path="/hr/analysis" element={<Protected user={user} allow={["hr", "admin"]}>{shell(<HrAnalysisPage rows={employees} loading={loading.employees} error={errors.employees} />)}</Protected>} />
      <Route path="/hr/reports" element={<Protected user={user} allow={["hr", "admin"]}>{shell(<ReportsPage role="hr" rows={employees} loading={loading.employees} error={errors.employees} />)}</Protected>} />
      <Route path="/hr" element={<Protected user={user} allow={["hr", "admin"]}><Navigate to="/hr/dashboard" replace /></Protected>} />
      <Route path="/hr/*" element={<Protected user={user} allow={["hr", "admin"]}><Navigate to="/hr/dashboard" replace /></Protected>} />

      <Route path="/employee/report" element={<Protected user={user} allow={["employee"]}>{shell(<EmployeeReportPage profile={employeeProfile} loading={loading.employee} error={errors.employee} />)}</Protected>} />
      <Route path="/employee/profile" element={<Protected user={user} allow={["employee"]}>{shell(<EmployeeProfilePage profile={employeeProfile} loading={loading.employee} error={errors.employee} />)}</Protected>} />
      <Route path="/employee/performance" element={<Protected user={user} allow={["employee"]}>{shell(<EmployeePerformancePage profile={employeeProfile} loading={loading.employee} error={errors.employee} />)}</Protected>} />
      <Route path="/employee/settings" element={<Protected user={user} allow={["employee"]}>{shell(<EmployeeSettingsPage user={user} onLogout={logout} />)}</Protected>} />
      <Route path="/employee/dashboard" element={<Protected user={user} allow={["employee"]}>{shell(<EmployeeDashboard profile={employeeProfile} loading={loading.employee} error={errors.employee} />)}</Protected>} />
      <Route path="/employee" element={<Protected user={user} allow={["employee"]}><Navigate to="/employee/report" replace /></Protected>} />
      <Route path="/employee/*" element={<Protected user={user} allow={["employee"]}><Navigate to="/employee/report" replace /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
