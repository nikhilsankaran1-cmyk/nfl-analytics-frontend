import { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const API = "http://localhost:8080/api";

export default function WinProbabilityPage() {
  const [gameId, setGameId] = useState("2024_01_BAL_KC");
  const [data, setData] = useState([]);
  const [keyPlays, setKeyPlays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState({ home: "", away: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [wp, kp] = await Promise.all([
        axios.get(`${API}/games/win-probability?gameId=${gameId}`),
        axios.get(`${API}/games/key-plays?gameId=${gameId}`)
      ]);

      if (wp.data.length > 0) {
        setTeams({ home: wp.data[0].home_team, away: wp.data[0].away_team });
      }

      // Convert to chart format — home team win probability over time
      const chartData = wp.data.map(p => ({
        second: 3600 - p.game_seconds_remaining,
        homeWP: p.posteam === p.home_team
          ? Math.round(p.wp * 100)
          : Math.round((1 - p.wp) * 100),
        quarter: p.qtr,
        score: `${p.away_team} ${p.defteam_score ?? 0} - ${p.posteam_score ?? 0} ${p.home_team}`
      }));

      setData(chartData);
      setKeyPlays(kp.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatTime = (second) => {
    const q = Math.floor(second / 900) + 1;
    return `Q${Math.min(q, 4)}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background: "#1a1a1a", border: "1px solid #333", padding: "10px", borderRadius: "6px"}}>
          <p style={{color: "#00d4ff"}}>{teams.home} Win Probability: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="card">
        <h2>Win Probability Graph</h2>
        <div>
          <input
            value={gameId}
            onChange={e => setGameId(e.target.value)}
            placeholder="Game ID e.g. 2024_01_BAL_KC"
            style={{width: "280px"}}
          />
          <button className="primary" onClick={load}>Load Game</button>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {data.length > 0 && (
          <>
            <div style={{marginBottom: "8px", color: "#888", fontSize: "14px"}}>
              {teams.away} @ {teams.home} — {teams.home} win probability throughout the game
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="second" tickFormatter={formatTime} stroke="#555" />
                <YAxis domain={[0, 100]} stroke="#555" tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50} stroke="#444" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="homeWP"
                  stroke="#00d4ff"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {keyPlays.length > 0 && (
        <div className="card">
          <h2>Key Plays (by EPA impact)</h2>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Qtr</th>
                <th>Type</th>
                <th>Yards</th>
                <th>EPA</th>
                <th>TD</th>
                <th>INT</th>
              </tr>
            </thead>
            <tbody>
              {keyPlays.map((p, i) => (
                <tr key={i}>
                  <td>{p.posteam}</td>
                  <td>{p.qtr}</td>
                  <td>{p.play_type}</td>
                  <td>{p.yards_gained}</td>
                  <td style={{color: p.epa > 0 ? "#00d4ff" : "#ff4444"}}>
                    {p.epa > 0 ? `+${p.epa?.toFixed(2)}` : p.epa?.toFixed(2)}
                  </td>
                  <td>{p.touchdown ? "✓" : ""}</td>
                  <td>{p.interception ? "✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}