import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API = "http://localhost:8080/api";

export default function SimulatorPage() {
  const [data, setData] = useState([]);
  const [view, setView] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/simulator/projections?season=2026`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  const filtered = view === "all"
    ? data
    : data.filter(t => t.conference === view);

  const chartData = filtered
    .filter(t => t.superbowl_pct > 0)
    .sort((a, b) => b.superbowl_pct - a.superbowl_pct)
    .slice(0, 16);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "12px", borderRadius: "8px" }}>
          <p style={{ color: "#fff", fontWeight: 600, marginBottom: "4px" }}>{d.team}</p>
          <p style={{ color: "#888", fontSize: "13px" }}>Super Bowl: <span style={{ color: "#00d4ff" }}>{d.superbowl_pct}%</span></p>
          <p style={{ color: "#888", fontSize: "13px" }}>Playoffs: <span style={{ color: "#00d4ff" }}>{d.playoff_pct}%</span></p>
          <p style={{ color: "#888", fontSize: "13px" }}>Vegas wins: <span style={{ color: "#fff" }}>{d.vegas_wins}</span></p>
          <p style={{ color: "#888", fontSize: "13px" }}>Sim avg wins: <span style={{ color: "#fff" }}>{d.avg_wins}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="card">
        <h2>2026 Season Simulator</h2>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
          10,000 Monte Carlo simulations calibrated to Vegas win totals
        </p>

        <div style={{ marginBottom: "16px" }}>
          {["all", "AFC", "NFC"].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "#00d4ff" : "transparent",
                border: "1px solid #333",
                color: view === v ? "#000" : "#aaa",
                padding: "8px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "8px",
                fontWeight: view === v ? 600 : 400
              }}>
              {v === "all" ? "All Teams" : v}
            </button>
          ))}
        </div>

        {loading && <div className="loading">Loading projections...</div>}

        {chartData.length > 0 && (
          <>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "12px" }}>
              Super Bowl win probability (hover for details)
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="team" stroke="#555" tick={{ fontSize: 12 }} />
                <YAxis stroke="#555" tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="superbowl_pct" radius={[4, 4, 0, 0]} fill="#00d4ff" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {data.length > 0 && (
        <div className="card">
          <h2>Full Projections Table</h2>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Conference</th>
                <th>Division</th>
                <th>Vegas Wins</th>
                <th>Sim Avg Wins</th>
                <th>Playoff %</th>
                <th>Super Bowl %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{t.team}</td>
                  <td>{t.conference}</td>
                  <td style={{ fontSize: "13px", color: "#888" }}>{t.division}</td>
                  <td>{t.vegas_wins}</td>
                  <td>{t.avg_wins}</td>
                  <td style={{ color: t.playoff_pct > 50 ? "#00d4ff" : "#888" }}>
                    {t.playoff_pct}%
                  </td>
                  <td style={{ color: t.superbowl_pct > 5 ? "#00d4ff" : "#888", fontWeight: t.superbowl_pct > 10 ? 600 : 400 }}>
                    {t.superbowl_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}