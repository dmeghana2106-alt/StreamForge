import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [stats, setStats] = useState({
    total_events: 0,
    events_per_second: 0,
    active_streams: 0,
    processing_time: 0,
  });

  const [events, setEvents] = useState([]);
  const [streaming, setStreaming] = useState(true);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000";

  // Get data from backend
  const fetchDashboardData = async () => {
    try {
      const [statsResponse, eventsResponse] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/events`),
      ]);

      const statsData = await statsResponse.json();
      const eventsData = await eventsResponse.json();

      setStats(statsData);
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error("Backend connection failed:", error);
      setLoading(false);
    }
  };

  // Load backend data when page opens
  useEffect(() => {
    fetchDashboardData();

    // Refresh every 5 seconds
    const interval = setInterval(fetchDashboardData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>StreamForge</h1>

        <nav>
          <a className="active">Dashboard</a>
          <a>Streams</a>
          <a>Events</a>
          <a>Analytics</a>
          <a>Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <p>Kafka Status</p>
          <span className="online">● Online</span>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div>
            <h2>Streaming Dashboard</h2>
            <p>Monitor your real-time data pipeline</p>
          </div>

          <button
            className={streaming ? "stop-btn" : "start-btn"}
            onClick={() => setStreaming(!streaming)}
          >
            {streaming ? "■ Stop Stream" : "▶ Start Stream"}
          </button>
        </header>

        {/* Statistics */}
        <section className="stats">
          <div className="card">
            <h3>Total Events</h3>
            <strong>
              {loading ? "..." : stats.total_events.toLocaleString()}
            </strong>
            <span>From StreamForge API</span>
          </div>

          <div className="card">
            <h3>Events / Sec</h3>
            <strong>
              {loading ? "..." : stats.events_per_second}
            </strong>
            <span>Live throughput</span>
          </div>

          <div className="card">
            <h3>Active Streams</h3>
            <strong>
              {loading ? "..." : stats.active_streams}
            </strong>
            <span>All systems healthy</span>
          </div>

          <div className="card">
            <h3>Processing Time</h3>
            <strong>
              {loading ? "..." : `${stats.processing_time} ms`}
            </strong>
            <span>Average latency</span>
          </div>
        </section>

        {/* Chart */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Real-Time Event Flow</h3>
              <p>Events processed over the last 60 seconds</p>
            </div>

            <span className="live">● LIVE</span>
          </div>

          <div className="chart">
            <div className="bar" style={{ height: "35%" }}></div>
            <div className="bar" style={{ height: "55%" }}></div>
            <div className="bar" style={{ height: "42%" }}></div>
            <div className="bar" style={{ height: "70%" }}></div>
            <div className="bar" style={{ height: "60%" }}></div>
            <div className="bar" style={{ height: "85%" }}></div>
            <div className="bar" style={{ height: "65%" }}></div>
            <div className="bar" style={{ height: "92%" }}></div>
            <div className="bar" style={{ height: "75%" }}></div>
            <div className="bar" style={{ height: "100%" }}></div>
            <div className="bar" style={{ height: "80%" }}></div>
            <div className="bar" style={{ height: "90%" }}></div>
          </div>
        </section>

        {/* Events */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Events</h3>
              <p>Latest events received from Kafka</p>
            </div>
          </div>

          {loading ? (
            <p>Loading events...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Topic</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>#{event.id}</td>
                    <td>{event.topic}</td>
                    <td>{event.type}</td>
                    <td>
                      <span className="success">
                        {event.status}
                      </span>
                    </td>
                    <td>{event.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
