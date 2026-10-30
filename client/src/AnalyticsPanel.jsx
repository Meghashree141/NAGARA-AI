import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e"
};

const STATUS_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#ef4444"
];

function normalizeData(data, keyName) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item) => ({
      name: item[keyName] || item.name || "Other",
      count: Number(item.count ?? item.total ?? 0)
    }));
  }

  return Object.entries(data).map(([name, count]) => ({
    name,
    count: Number(count)
  }));
}

function AnalyticsPanel({ analytics }) {
  if (!analytics) return null;

  const priorityData = normalizeData(
    analytics.priorityCounts,
    "priority"
  );

  const statusData = normalizeData(
    analytics.statusCounts,
    "status"
  );

  const categoryData = normalizeData(
    analytics.categoryCounts,
    "category"
  );

  const hotspots = analytics.hotspots || [];

  const overview = analytics.overview || {};

  const total = Number(overview.total || 0);
  const resolved = Number(overview.resolved || 0);

  const resolutionRate =
    total > 0 ? Math.round((resolved / total) * 100) : 0;

  const chartCard = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    minWidth: 0
  };

  const chartTitle = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "5px"
  };

  const chartDescription = {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "20px"
  };

  return (
    <section id="analytics" style={{ marginTop: "35px" }}>

      <div style={{ marginBottom: "22px" }}>
        <h3 style={{ fontSize: "21px", margin: "0 0 7px" }}>
          Civic Analytics & Intelligence
        </h3>

        <p style={{ color: "#64748b", fontSize: "13px" }}>
          Data-driven insights into civic complaints and resolution.
        </p>
      </div>

      {/* RESOLUTION RATE */}

      <div style={{
        ...chartCard,
        marginBottom: "22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "15px" }}>
            Complaint Resolution Rate
          </h4>

          <p style={{ color: "#64748b", fontSize: "12px" }}>
            Percentage of complaints successfully resolved.
          </p>
        </div>

        <div style={{
          fontSize: "30px",
          fontWeight: 800,
          color: "#16a34a"
        }}>
          {resolutionRate}%
        </div>

        <div style={{
          width: "100%",
          height: "9px",
          background: "#e2e8f0",
          borderRadius: "20px",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${resolutionRate}%`,
            height: "100%",
            background: "#22c55e",
            borderRadius: "20px",
            transition: "width 0.5s"
          }} />
        </div>
      </div>

      {/* CHART GRID */}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
        gap: "20px"
      }}>

        {/* PRIORITY CHART */}

        <div style={chartCard}>
          <h4 style={chartTitle}>Priority Distribution</h4>

          <p style={chartDescription}>
            Complaints classified by urgency.
          </p>

          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={48}
                  paddingAngle={4}
                  label
                >
                  {priorityData.map((item, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[item.name.toUpperCase()] || "#64748b"}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS CHART */}

        <div style={chartCard}>
          <h4 style={chartTitle}>Complaint Status</h4>

          <p style={chartDescription}>
            Current progress of reported issues.
          </p>

          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer>
              <BarChart
                data={statusData}
                margin={{ top: 10, right: 10, left: -20, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  fontSize={10}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Complaints"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CATEGORY CHART */}

        <div style={chartCard}>
          <h4 style={chartTitle}>Civic Issue Categories</h4>

          <p style={chartDescription}>
            Most frequently reported civic problems.
          </p>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: 15, right: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis type="number" allowDecimals={false} />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={115}
                  fontSize={10}
                  tickFormatter={(value) =>
                    value.replaceAll("_", " ")
                  }
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Complaints"
                  fill="#0ea5e9"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HOTSPOTS */}

        <div style={chartCard}>
          <h4 style={chartTitle}>Civic Hotspots</h4>

          <p style={chartDescription}>
            Locations with the highest complaint concentration.
          </p>

          {hotspots.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "13px" }}>
              No hotspot data available yet.
            </p>
          ) : (
            hotspots.map((spot, index) => (
              <div
                key={spot.location_name || index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  padding: "13px 0",
                  borderBottom: "1px solid #e2e8f0"
                }}
              >
                <div>
                  <strong style={{ fontSize: "13px" }}>
                    {index + 1}. {spot.location_name}
                  </strong>

                  <p style={{
                    color: "#64748b",
                    fontSize: "11px",
                    margin: "5px 0 0"
                  }}>
                    Critical: {spot.critical_count ?? 0} |
                    High: {spot.high_count ?? 0}
                  </p>
                </div>

                <span style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700
                }}>
                  {spot.total ?? spot.count ?? 0}
                </span>
              </div>
            ))
          )}
        </div>

      </div>

    </section>
  );
}

export default AnalyticsPanel;