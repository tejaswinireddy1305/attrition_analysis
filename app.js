const app = document.getElementById("app");

const users = [
  { username: "admin", password: "admin123", role: "admin", name: "Alex Admin" },
  { username: "admin2", password: "admin@123", role: "admin", name: "Amy Admin" },
  { username: "hr", password: "hr123", role: "hr", name: "Harsha HR" },
  { username: "employee", password: "emp123", role: "employee", name: "Esha Employee" }
];

function render() {
  const session = JSON.parse(localStorage.getItem("attrition_session") || "null");
  if (!session) {
    renderLogin();
    return;
  }
  renderDashboard(session);
}

function renderLogin(error = "") {
  app.innerHTML = `
    <section class="login-wrap">
      <div class="login-brand">
        <h1>Attrition Analysis System</h1>
        <p>
          Role-based analytics portal for Admin, HR, and Employee users.
          HR/Admin can upload and analyze data. Employees can only view personal performance.
        </p>
      </div>
      <div class="login-panel">
        <form id="login-form" class="card">
          <h2>Welcome Back</h2>
          <p class="sub">Sign in to continue</p>
          <div class="form-group">
            <label for="role">Login as</label>
            <select id="role" required>
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" placeholder="Enter username" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="Enter password" required />
          </div>
          <button class="btn" type="submit">Login</button>
          <p class="sub" style="margin-top:10px;">Demo: admin/admin123, admin2/admin@123, hr/hr123, employee/emp123</p>
          ${error ? `<p class="error">${error}</p>` : ""}
        </form>
      </div>
    </section>
  `;

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const role = document.getElementById("role").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const user = users.find(
      (u) => u.role === role && u.username === username && u.password === password
    );

    if (!user) {
      renderLogin("Invalid credentials for selected role.");
      return;
    }

    localStorage.setItem("attrition_session", JSON.stringify(user));
    render();
  });
}

function getMenuByRole(role) {
  if (role === "employee") return ["My Profile", "My Performance", "Settings"];
  if (role === "hr")
    return ["Dashboard", "Employees", "Upload Data", "Preprocessing", "Analysis", "Reports", "Settings"];
  return ["Dashboard", "Users", "Employees", "Teams", "Upload Data", "Analysis", "Reports", "Settings"];
}

function renderDashboard(session) {
  const menu = getMenuByRole(session.role);

  app.innerHTML = `
    <section class="app-shell">
      <aside class="sidebar">
        <div class="brand">HRA Dashboard</div>
        <nav class="nav">
          ${menu.map((item, i) => `<button class="${i === 0 ? "active" : ""}">${item}</button>`).join("")}
          <button id="logout-btn">Logout</button>
        </nav>
      </aside>
      <section class="content">
        <div class="topbar">
          <div><strong>${session.name}</strong> (${session.role.toUpperCase()})</div>
          <div class="topbar-meta">Role-based visibility enabled</div>
        </div>
        ${session.role === "employee" ? employeeView() : analyticsView(session.role)}
      </section>
    </section>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("attrition_session");
    render();
  });
}

function analyticsView(role) {
  return `
    <div class="grid kpi-grid">
      <div class="kpi"><small>Total Employees</small><h3>3,142</h3></div>
      <div class="kpi"><small>Attrition Rate</small><h3>14.8%</h3></div>
      <div class="kpi"><small>High-Risk Employees</small><h3>187</h3></div>
      <div class="kpi"><small>Avg. Satisfaction</small><h3>4.1 / 5</h3></div>
    </div>

    <div class="grid panel-grid" style="margin-top:14px;">
      <div class="panel">
        <strong>Attrition by Department</strong>
        <div class="chart-placeholder">Bar Chart Placeholder</div>
      </div>
      <div class="panel">
        <strong>Attrition by Job Role</strong>
        <div class="chart-placeholder">Donut Chart Placeholder</div>
      </div>
    </div>

    <div class="grid panel-grid" style="margin-top:14px;">
      <div class="panel">
        <strong>Salary Band vs Attrition</strong>
        <div class="chart-placeholder">Line Chart Placeholder</div>
      </div>
      <div class="panel">
        <strong>Years at Company vs Attrition</strong>
        <div class="chart-placeholder">Area Chart Placeholder</div>
      </div>
    </div>

    <div class="table-panel" style="margin-top:14px;">
      <table>
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Risk Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>E1102</td>
            <td>Sarah Adams</td>
            <td>Sales</td>
            <td>Executive</td>
            <td><span class="tag tag-high">92%</span></td>
            <td>Retention Meeting</td>
          </tr>
          <tr>
            <td>E1109</td>
            <td>Priya Sharma</td>
            <td>Marketing</td>
            <td>Analyst</td>
            <td><span class="tag tag-med">66%</span></td>
            <td>Manager Follow-up</td>
          </tr>
          <tr>
            <td>E1123</td>
            <td>Liam O'Donnell</td>
            <td>Operations</td>
            <td>Coordinator</td>
            <td><span class="tag tag-low">27%</span></td>
            <td>Stable</td>
          </tr>
        </tbody>
      </table>
    </div>
    ${
      role === "admin"
        ? `<p class="sub" style="margin-top:10px;">Admin can access all teams and user management.</p>`
        : `<p class="sub" style="margin-top:10px;">HR can upload and modify only own team data.</p>`
    }
  `;
}

function employeeView() {
  return `
    <div class="grid kpi-grid">
      <div class="kpi"><small>Performance Rating</small><h3>4.3 / 5</h3></div>
      <div class="kpi"><small>Job Satisfaction</small><h3>4.1 / 5</h3></div>
      <div class="kpi"><small>Years at Company</small><h3>3.8</h3></div>
      <div class="kpi"><small>Current Role</small><h3>Data Analyst</h3></div>
    </div>

    <div class="grid panel-grid" style="margin-top:14px;">
      <div class="panel">
        <strong>My Profile</strong>
        <p class="sub">Employee ID: EMP-9932</p>
        <p class="sub">Department: Analytics</p>
        <p class="sub">Manager: R. Kapoor</p>
        <p class="sub">Shift: General</p>
      </div>
      <div class="panel">
        <strong>Recent Appraisal</strong>
        <p class="sub">Goal Completion: 86%</p>
        <p class="sub">Team Collaboration: Excellent</p>
        <p class="sub">Learning Progress: 2 certifications completed</p>
        <p class="sub">Recommendation: Continue skill growth plan</p>
      </div>
    </div>

    <div class="panel" style="margin-top:14px;">
      <strong>Access Restriction</strong>
      <p class="sub">
        Company-wide attrition graphs, high-risk employee tables, uploads, preprocessing, and reports are hidden
        for employee role.
      </p>
    </div>
  `;
}

render();
