import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

const TEAMS = [
  "ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE",
  "DAL","DEN","DET","GB","HOU","IND","JAX","KC",
  "LA","LAC","LV","MIA","MIN","NE","NO","NYG",
  "NYJ","PHI","PIT","SEA","SF","TB","TEN","WAS"
];

export default function TeamPage() {
  const [team, setTeam] = useState("KC");
  const [season, setSeason] = useState(2024);
  const [data, setData] = useState(null);
  const [leaders, setLeaders] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, l] = await Promise.all([
        axios.get(`${API}/teams/${team}/tendencies?season=${season}`),
        axios.get(`${API}/teams/${team}/passing-leaders?season=${season}`)
      ]);
      setData(t.data);
      setLeaders(l.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const pct = (v) => v ? `${(v * 100).toFixed(1)}%` : "—";
  const epa = (v) => v ? (v > 0 ? `+${v}` : `${v}`) : "—";

  return (
    <div>
      <div className="card">
        <h2>Team Tendencies</h2>
        <div>
          <select value={team} onChange={e => setTeam(e.target.value)}>
            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={season} onChange={e => setSeason(e.target.value)}>
            {[2025, 2024, 2023, 2022].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="primary" onClick={load}>Load</button>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {data && (
          <>
            <div className="stat-grid">
              <div className="stat-box">
                <div className="label">Pass Rate</div>
                <div className="value">{pct(data.pass_rate)}</div>
              </div>
              <div className="stat-box">
                <div className="label">Run Rate</div>
                <div className="value">{pct(data.run_rate)}</div>
              </div>
              <div className="stat-box">
                <div className="label">Avg EPA/Play</div>
                <div className="value">{epa(data.avg_epa)}</div>
              </div>
              <div className="stat-box">
                <div className="label">Pass EPA</div>
                <div className="value">{epa(data.pass_epa)}</div>
              </div>
              <div className="stat-box">
                <div className="label">Run EPA</div>
                <div className="value">{epa(data.run_epa)}</div>
              </div>
              <div className="stat-box">
                <div className="label">3rd Down Pass</div>
                <div className="value">{pct(data.third_down_pass_rate)}</div>
              </div>
              <div className="stat-box">
                <div className="label">Red Zone Pass</div>
                <div className="value">{pct(data.redzone_pass_rate)}</div>
              </div>
              <div className="stat-box">
                <div className="label">Total Plays</div>
                <div className="value">{data.total_plays}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {leaders && leaders.length > 0 && (
        <div className="card">
          <h2>Passing Leaders</h2>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Attempts</th>
                <th>Total EPA</th>
                <th>EPA/Play</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((p, i) => (
                <tr key={i}>
                  <td>{p.player}</td>
                  <td>{p.attempts}</td>
                  <td style={{color: p.total_epa > 0 ? "#00d4ff" : "#ff4444"}}>
                    {p.total_epa > 0 ? `+${p.total_epa}` : p.total_epa}
                  </td>
                  <td>{p.avg_epa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}