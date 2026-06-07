import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

export default function FourthDownPage() {
  const [form, setForm] = useState({
    scoreDiff: 0,
    secondsRemaining: 480,
    yardline: 45,
    ydstogo: 2,
    posTeamTimeouts: 2,
    defTeamTimeouts: 2
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/fourth-down/analyze`, { params: form });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const pct = (v) => v != null ? `${(v * 100).toFixed(1)}%` : "N/A";

  const colorFor = (key) => {
    if (!result) return "#fff";
    return result.recommendation === key ? "#00d4ff" : "#888";
  };

  const minutesSeconds = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const scoreLabel = () => {
    if (form.scoreDiff === 0) return "Tied";
    return form.scoreDiff > 0
      ? `Up ${form.scoreDiff}`
      : `Down ${Math.abs(form.scoreDiff)}`;
  };

  return (
    <div>
      <div className="card">
        <h2>4th Down Decision Calculator</h2>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
          Enter the game situation to get an analytics-based recommendation.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
              Score Differential
            </label>
            <input
              type="number"
              value={form.scoreDiff}
              onChange={e => update("scoreDiff", parseInt(e.target.value))}
              style={{ width: "100%", margin: 0 }}
            />
            <div style={{ fontSize: "12px", color: "#00d4ff", marginTop: "4px" }}>{scoreLabel()}</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
              Seconds Remaining
            </label>
            <input
              type="number"
              value={form.secondsRemaining}
              onChange={e => update("secondsRemaining", parseInt(e.target.value))}
              style={{ width: "100%", margin: 0 }}
            />
            <div style={{ fontSize: "12px", color: "#00d4ff", marginTop: "4px" }}>{minutesSeconds(form.secondsRemaining)} remaining</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
              Yard Line (distance to end zone)
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={form.yardline}
              onChange={e => update("yardline", parseInt(e.target.value))}
              style={{ width: "100%", margin: 0 }}
            />
            <div style={{ fontSize: "12px", color: "#00d4ff", marginTop: "4px" }}>
              {form.yardline <= 50 ? `Opponent ${form.yardline}` : `Own ${100 - form.yardline}`} yard line
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
              Yards to Go
            </label>
            <input
              type="number"
              min="1"
              value={form.ydstogo}
              onChange={e => update("ydstogo", parseInt(e.target.value))}
              style={{ width: "100%", margin: 0 }}
            />
            <div style={{ fontSize: "12px", color: "#00d4ff", marginTop: "4px" }}>4th & {form.ydstogo}</div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
              Your Timeouts
            </label>
            <select
              value={form.posTeamTimeouts}
              onChange={e => update("posTeamTimeouts", parseInt(e.target.value))}
              style={{ width: "100%", margin: 0 }}
            >
              {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
              Opponent Timeouts
            </label>
            <select
              value={form.defTeamTimeouts}
              onChange={e => update("defTeamTimeouts", parseInt(e.target.value))}
              style={{ width: "100%", margin: 0 }}
            >
              {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <button className="primary" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {result && (
        <>
          <div className="card">
            <h2>Recommendation</h2>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#00d4ff", marginBottom: "8px" }}>
              {result.recommendation === "go_for_it" && "✓ Go For It"}
              {result.recommendation === "field_goal" && "✓ Kick Field Goal"}
              {result.recommendation === "punt" && "✓ Punt"}
            </div>
            <p style={{ color: "#888", fontSize: "14px" }}>
              Based on {(result.conversion_rate * 100).toFixed(1)}% historical conversion rate on 4th & {form.ydstogo}
              {result.fg_applicable && ` · ${result.kick_distance} yard field goal (${(result.fg_rate * 100).toFixed(0)}% make rate)`}
            </p>
          </div>

          <div className="stat-grid">
            <div className="stat-box" style={{ borderColor: colorFor("go_for_it") }}>
              <div className="label">Go For It</div>
              <div className="value" style={{ color: colorFor("go_for_it") }}>
                {pct(result.go_for_it)}
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>win probability</div>
            </div>

            <div className="stat-box" style={{ borderColor: colorFor("field_goal"), opacity: result.fg_applicable ? 1 : 0.4 }}>
              <div className="label">Field Goal</div>
              <div className="value" style={{ color: colorFor("field_goal") }}>
                {pct(result.field_goal)}
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                {result.fg_applicable ? "win probability" : "out of range"}
              </div>
            </div>

            <div className="stat-box" style={{ borderColor: colorFor("punt") }}>
              <div className="label">Punt</div>
              <div className="value" style={{ color: colorFor("punt") }}>
                {pct(result.punt)}
              </div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>win probability</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}