import { NavLink, useNavigate } from "react-router-dom";

const menus = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/hr-details", label: "HR Details" },
    { to: "/admin/employees", label: "Employees" },
    { to: "/admin/reports", label: "Reports" }
  ],
  hr: [
    { to: "/hr/dashboard", label: "Dashboard" },
    { to: "/hr/employees", label: "Employees" },
    { to: "/hr/upload", label: "Upload Data" },
    { to: "/hr/analysis", label: "Analysis" },
    { to: "/hr/reports", label: "Reports" }
  ],
  employee: [
    { to: "/employee/report", label: "My Report" },
    { to: "/employee/profile", label: "My Profile" },
    { to: "/employee/performance", label: "My Performance" },
    { to: "/employee/settings", label: "Settings" }
  ]
};

export default function Layout({ user, children, onLogout }) {
  const navigate = useNavigate();

  const logout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h3>HRA</h3>
          <small>Attrition Analysis</small>
        </div>
        <nav>
          {menus[user.role].map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-item">
              {item.label}
            </NavLink>
          ))}
          <button className="nav-item nav-logout" onClick={logout}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <strong>HR Analytics Dashboard</strong>
            <small>{user.name} ({user.role.toUpperCase()})</small>
          </div>
          <small className="topbar-chip">Live Data</small>
        </header>
        {children}
      </main>
    </div>
  );
}
