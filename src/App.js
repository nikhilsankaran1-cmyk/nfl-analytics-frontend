import { useState } from "react";
import TeamPage from "./components/TeamPage";
import GamesPage from "./components/GamesPage";
import WinProbabilityPage from "./components/WinProbabilityPage";
import FourthDownPage from "./components/FourthDownPage";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("teams");

  return (
    <div className="app">
      <nav className="navbar">
        <span className="nav-logo">🏈 NFL Analytics</span>
        <div className="nav-links">
          <button
            className={activePage === "teams" ? "active" : ""}
            onClick={() => setActivePage("teams")}>
            Teams
          </button>
          <button
            className={activePage === "games" ? "active" : ""}
            onClick={() => setActivePage("games")}>
            Games
          </button>
          <button
            className={activePage === "wp" ? "active" : ""}
            onClick={() => setActivePage("wp")}>
            Win Probability
          </button>
          <button
            className={activePage === "fourthdown" ? "active" : ""}
            onClick={() => setActivePage("fourthdown")}>
            4th Down
          </button>
        </div>
      </nav>

      <main className="content">
        {activePage === "teams" && <TeamPage />}
        {activePage === "games" && <GamesPage />}
        {activePage === "wp" && <WinProbabilityPage />}
        {activePage === "fourthdown" && <FourthDownPage />}
      </main>
    </div>
  );
}

export default App;