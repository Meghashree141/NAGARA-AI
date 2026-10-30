import { useEffect, useState } from "react";
import CitizenPortal from "./CitizenPortal";
import AnalyticsPanel from "./AnalyticsPanel";
import axios from "axios";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  MapPin,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Waves,
  Save
} from "lucide-react";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PRIORITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e"
};

const STATUS_OPTIONS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED"
];

function MapAutoFit({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) return;

    const coordinates = reports.map((report) => [
      Number(report.latitude),
      Number(report.longitude)
    ]);

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
    } else {
      map.fitBounds(coordinates, {
        padding: [50, 50],
        maxZoom: 14
      });
    }
  }, [map, reports]);

  return null;
}

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [officerNames, setOfficerNames] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const [reportsResponse, analyticsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/reports`),
        axios.get(`${API_URL}/api/analytics`)
      ]);

      setReports(reportsResponse.data.reports || []);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        "Unable to connect to the backend. Check whether your server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update complaint status.
  async function updateStatus(reportId, newStatus) {
    try {
      setSavingId(reportId);
      setError("");
      setSuccessMessage("");

      await axios.patch(
        `${API_URL}/api/reports/${reportId}/status`,
        { status: newStatus }
      );

      setSuccessMessage("Complaint status updated successfully!");

      await loadDashboard();
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.message || "Unable to update complaint status."
      );
    } finally {
      setSavingId(null);
    }
  }

  // Assign complaint to an officer.
  async function assignOfficer(reportId) {
    const officerName = officerNames[reportId]?.trim();

    if (!officerName) {
      setError("Please enter an officer name before assigning.");
      return;
    }

    try {
      setSavingId(reportId);
      setError("");
      setSuccessMessage("");

      await axios.patch(
        `${API_URL}/api/reports/${reportId}/assign`,
        { assigned_to: officerName }
      );

      setSuccessMessage(`Complaint assigned to ${officerName}.`);

      setOfficerNames((previous) => ({
        ...previous,
        [reportId]: ""
      }));

      await loadDashboard();
    } catch (err) {
      console.error("Officer assignment error:", err);

      setError(
        err.response?.data?.message || "Unable to assign officer."
      );
    } finally {
      setSavingId(null);
    }
  }

  const overview = analytics?.overview || {};

  const criticalCount = reports.filter(
    (report) => report.priority === "CRITICAL"
  ).length;

  const stats = [
    {
      label: "Total Complaints",
      value: overview.total ?? 0,
      icon: FileText,
      color: "blue",
      change: "All reported incidents"
    },
    {
      label: "Resolved",
      value: overview.resolved ?? 0,
      icon: CheckCircle2,
      color: "green",
      change: "Successfully completed"
    },
    {
      label: "Pending",
      value: overview.pending ?? 0,
      icon: Clock3,
      color: "orange",
      change: "Awaiting action"
    },
    {
      label: "Critical Issues",
      value: criticalCount,
      icon: AlertTriangle,
      color: "red",
      change: "Require urgent attention"
    }
  ];

  const mappedReports = reports.filter((report) => {
    const lat = Number(report.latitude);
    const lng = Number(report.longitude);

    return (
      report.latitude !== null &&
      report.latitude !== undefined &&
      report.longitude !== null &&
      report.longitude !== undefined &&
      report.latitude !== "" &&
      report.longitude !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  const mapCenter =
    mappedReports.length > 0
      ? [
          Number(mappedReports[0].latitude),
          Number(mappedReports[0].longitude)
        ]
      : [12.3, 76.6];

  const groupedReports = Object.values(
    mappedReports.reduce((groups, report) => {
      const key = `${Number(report.latitude).toFixed(4)},${Number(
        report.longitude
      ).toFixed(4)}`;

      if (!groups[key]) groups[key] = [];

      groups[key].push(report);

      return groups;
    }, {})
  );

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <Waves size={25} />
          </div>

          <div>
            <h2>NAGARA<span>AI</span></h2>
            <p>CIVIC INTELLIGENCE</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a className="nav-item" href="#complaints">
            <FileText size={19} />
            Complaints
            <span className="nav-count">{overview.total ?? 0}</span>
          </a>

          <a className="nav-item" href="#map">
            <MapPin size={19} />
            Live Map
          </a>

          <a className="nav-item" href="#analytics">
            <BarChart3 size={19} />
            Analytics
          </a>

          <a className="nav-item" href="#departments">
            <Users size={19} />
            Departments
          </a>
        </nav>

        <div className="nav-label intelligence-label">
          INTELLIGENCE
        </div>

        <nav className="navigation">
          <a className="nav-item" href="#priority">
            <AlertTriangle size={19} />
            Priority Alerts
          </a>

          <a className="nav-item" href="#activity">
            <Activity size={19} />
            Activity Logs
          </a>
        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>
            <div>
              <strong>System Operational</strong>
              <p>Backend connection active</p>
            </div>
          </div>

          <a className="nav-item" href="#settings">
            <Settings size={19} />
            Settings
          </a>

          <div className="profile">
            <div className="avatar">NA</div>
            <div>
              <strong>Administrator</strong>
              <p>City Operations</p>
            </div>
            <ChevronDown size={16} />
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" id="dashboard">

        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Overview</strong>
          </div>

          <div className="topbar-actions">
            <div className="live-indicator">
              <span></span>
              LIVE SYSTEM
            </div>

            <button className="icon-button" aria-label="Search">
              <Search size={19} />
            </button>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>

            <div className="top-avatar">A</div>
          </div>
        </header>

        <section className="page-content">

          {/* WELCOME */}
          <div className="welcome-section">
            <div>
              <div className="eyebrow">
                <ShieldCheck size={15} />
                SMART CITY MANAGEMENT PLATFORM
              </div>

              <h1>
                Civic Intelligence <span>Dashboard</span>
              </h1>

              <p>
                Monitor public issues, understand city conditions and
                coordinate faster civic action.
              </p>
            </div>

            <a href="/citizen" className="primary-button">
              <Plus size={18} />
              Citizen Portal
            </a>
          </div>

          {/* MESSAGES */}
          {error && (
            <div className="error-banner">
              <AlertTriangle size={18} />
              {error}
              <button onClick={loadDashboard}>Retry</button>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "13px 17px",
              borderRadius: "9px",
              marginBottom: "20px",
              fontWeight: 600
            }}>
              <CheckCircle2 size={17} style={{ verticalAlign: "middle" }} />
              {" "}{successMessage}
            </div>
          )}

          {/* OVERVIEW */}
          <div className="section-heading">
            <div>
              <h3>City Overview</h3>
              <p>Current civic performance indicators</p>
            </div>

            <span className="updated-label">
              <span className="status-dot"></span>
              Auto-refresh every 30 seconds
            </span>
          </div>

          <section className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div className="stat-card" key={stat.label}>
                  <div className="stat-top">
                    <div className={`stat-icon ${stat.color}`}>
                      <Icon size={21} />
                    </div>

                    <ArrowUpRight size={17} className="stat-arrow" />
                  </div>

                  <div className="stat-value">
                    {loading ? "—" : stat.value}
                  </div>

                  <div className="stat-label">{stat.label}</div>

                  <div className="stat-description">{stat.change}</div>
                </div>
              );
            })}
          </section>

          {/* ADVANCED ANALYTICS */}
          <AnalyticsPanel analytics={analytics} />

          {/* MAP */}
          <section className="map-section" id="map">

            <div className="section-heading map-heading">
              <div>
                <h3>Geospatial Intelligence</h3>
                <p>Visualise civic complaints across reported locations</p>
              </div>

              <div className="map-badge">
                <MapPin size={15} />
                Complaint Locations
              </div>
            </div>

            <div className="map-container">

              <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}`}
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="leaflet-map"
              >

                <MapAutoFit reports={mappedReports} />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {groupedReports.map((group) => {

                  const priorityOrder = {
                    CRITICAL: 4,
                    HIGH: 3,
                    MEDIUM: 2,
                    LOW: 1
                  };

                  const highestPriorityReport = [...group].sort(
                    (a, b) =>
                      (priorityOrder[b.priority] || 0) -
                      (priorityOrder[a.priority] || 0)
                  )[0];

                  const color =
                    PRIORITY_COLORS[highestPriorityReport.priority] ||
                    "#64748b";

                  return (
                    <CircleMarker
                      key={`${group[0].latitude}-${group[0].longitude}`}
                      center={[
                        Number(group[0].latitude),
                        Number(group[0].longitude)
                      ]}
                      radius={10 + Math.min(group.length * 2, 8)}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        fillColor: color,
                        fillOpacity: 0.9
                      }}
                    >
                      <Popup>
                        <div className="map-info">
                          <strong>
                            {group.length} Complaint
                            {group.length > 1 ? "s" : ""}
                            {" at this location"}
                          </strong>

                          {group.map((report) => (
                            <div key={report.id}>
                              <hr />
                              <strong>{report.title}</strong>
                              <p>{report.location_name}</p>
                              <p>
                                <b>Category:</b>{" "}
                                {report.category?.replaceAll("_", " ")}
                              </p>
                              <p><b>Priority:</b> {report.priority}</p>
                              <p>
                                <b>Status:</b>{" "}
                                {report.status?.replaceAll("_", " ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

              </MapContainer>

              {mappedReports.length === 0 && (
                <div className="map-empty-overlay">
                  <MapPin size={20} />
                  No complaints with valid coordinates yet.
                </div>
              )}

            </div>

            <div className="map-legend">
              {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                <div className="legend-item" key={priority}>
                  <span style={{ background: color }}></span>
                  {priority}
                </div>
              ))}
            </div>

            <div className="map-summary">
              Showing {mappedReports.length} complaint records
              across {groupedReports.length} mapped locations.
            </div>

          </section>

          {/* ADMIN COMPLAINT MANAGEMENT */}
          <section className="complaints-section" id="complaints">

            <div className="section-heading">
              <div>
                <h3>Admin Complaint Management</h3>
                <p>Review complaints, update status and assign officers.</p>
              </div>

              <span className="total-badge">
                {reports.length} RECORDS
              </span>
            </div>

            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>COMPLAINT</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>PRIORITY</th>
                    <th>STATUS MANAGEMENT</th>
                    <th>OFFICER ASSIGNMENT</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td colSpan="6" className="empty-state">
                        Loading complaints...
                      </td>
                    </tr>

                  ) : reports.length === 0 ? (

                    <tr>
                      <td colSpan="6" className="empty-state">
                        No complaints have been submitted yet.
                      </td>
                    </tr>

                  ) : (

                    reports.map((report) => (

                      <tr key={report.id}>

                        <td>
                          <div className="complaint-title">
                            {report.title}
                          </div>

                          <div className="complaint-id">
                            #{report.id?.slice(0, 8)}
                          </div>
                        </td>

                        <td>
                          <span className="category-text">
                            {report.category?.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td>
                          <div className="location-text">
                            <MapPin size={14} />
                            {report.location_name}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`priority-badge ${report.priority?.toLowerCase()}`}
                          >
                            {report.priority}
                          </span>
                        </td>

                        {/* STATUS UPDATE */}
                        <td>
                          <select
                            value={report.status}
                            disabled={savingId === report.id}
                            onChange={(event) =>
                              updateStatus(report.id, event.target.value)
                            }
                            style={{
                              padding: "9px",
                              borderRadius: "7px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              fontSize: "12px",
                              minWidth: "145px"
                            }}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* OFFICER ASSIGNMENT */}
                        <td>
                          <div style={{
                            display: "flex",
                            gap: "7px",
                            minWidth: "210px"
                          }}>

                            <input
                              type="text"
                              placeholder={report.assigned_to || "Officer name"}
                              value={officerNames[report.id] || ""}
                              disabled={savingId === report.id}
                              onChange={(event) =>
                                setOfficerNames((previous) => ({
                                  ...previous,
                                  [report.id]: event.target.value
                                }))
                              }
                              style={{
                                width: "125px",
                                minWidth: 0,
                                padding: "9px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "7px"
                              }}
                            />

                            <button
                              onClick={() => assignOfficer(report.id)}
                              disabled={savingId === report.id}
                              title="Assign officer"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "8px",
                                border: "none",
                                borderRadius: "7px",
                                background: "#2563eb",
                                color: "#ffffff",
                                cursor: "pointer"
                              }}
                            >
                              <Save size={15} />
                              Save
                            </button>

                          </div>

                          {report.assigned_to && (
                            <small style={{
                              display: "block",
                              marginTop: "6px",
                              color: "#64748b"
                            }}>
                              Assigned: {report.assigned_to}
                            </small>
                          )}

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* FOOTER */}
          <footer className="footer">
            <span>© 2026 NAGARA AI</span>
            <span>From Citizen Voice to Intelligent Civic Action.</span>
            <span>Version 1.0.0</span>
          </footer>

        </section>
      </main>
    </div>
  );
}

function App() {
  if (window.location.pathname === "/citizen") {
    return <CitizenPortal />;
  }

  return <Dashboard />;
}

export default App;