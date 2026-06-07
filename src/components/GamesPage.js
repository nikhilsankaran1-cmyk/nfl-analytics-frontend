import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

export default function GamesPage() {
  const [season, setSeason] = useState(2024);
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/games?season=${season}&week=${week}`);
      setGames(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card">
        <h2>Game Results</h2>
        <div>
          <select value={season} onChange={e => setSeason(e.target.value)}>
            {[2025, 2024, 2023, 2022].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={week} onChange={e => setWeek(e.target.value)}>
            {Array.from({length: 18}, (_, i) => i + 1).map(w => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
          <button className="primary" onClick={load}>Load</button>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {games.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Away</th>
                <th>Score</th>
                <th>Home</th>
                <th>Score</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g, i) => (
                <tr key={i}>
                  <td>{g.away_team}</td>
                  <td>{g.away_score}</td>
                  <td>{g.home_team}</td>
                  <td>{g.home_score}</td>
                  <td style={{color: "#00d4ff", fontWeight: 600}}>
                    {g.home_score > g.away_score ? g.home_team : g.away_team}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}