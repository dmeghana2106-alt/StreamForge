import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const menuItems = [
  { icon: "⌂", label: "Dashboard" },
  { icon: "◉", label: "Live Streams" },
  { icon: "▣", label: "Topics" },
  { icon: "⌘", label: "Pipelines" },
  { icon: "◌", label: "Consumers" },
  { icon: "⌁", label: "Analytics" },
  { icon: "♧", label: "Alerts" },
  { icon: "⚙", label: "Settings" },
];

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
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [chartData, setChartData] = useState(
    [35, 48, 42, 65, 55, 72, 60, 82, 68, 88, 76, 94]
  );

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, eventsResponse] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/events`),
      ]);

      if (!statsResponse.ok || !eventsResponse.ok) {
        throw new Error("Backend request failed");
      }

      const statsData = await statsResponse.json();
      const eventsData = await eventsResponse.json();

      setStats(statsData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setLastUpdated(new Date());

      setChartData((previous) => {
  const baseValue =
    Number(statsData.events_per_second) / 20 || 35;

  const variation = (Math.random() - 0.5) * 20;

  const newValue = Math.max(
    15,
    Math.min(100, baseValue + variation)
  );

  return [...previous.slice(1), newValue];
});

      setLoading(false);
    } catch (error) {
      console.error("Backend connection failed:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5000);

    return () => clearInterval(interval);
  }, []);

  const topicData = useMemo(() => {
    const counts = {};

    events.forEach((event) => {
      const topic = event.topic || "unknown";
      counts[topic] = (counts[topic] || 0) + 1;
    });

    const colors = ["purple", "blue", "green", "yellow", "red"];

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count], index) => ({
        topic,
        count,
        color: colors[index],
      }));
  }, [events]);

  const maxTopicCount = Math.max(
    ...topicData.map((item) => item.count),
    1
  );

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">ϟ</div>

          <div>
            <h1>
              STREAM<span>FORGE</span>
            </h1>
            <p>Real-time Streaming Platform</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`nav-item ${index === 0 ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="cluster-card">
          <div className="cluster-header">
            <span>Kafka Cluster</span>
            <span className="healthy-badge">Healthy</span>
          </div>

          <div className="cluster-row">
            <span>Brokers</span>
            <strong>3/3 Online</strong>
          </div>

          <div className="cluster-row">
            <span>Topics</span>
            <strong>12</strong>
          </div>

          <div className="cluster-row">
            <span>Partitions</span>
            <strong>48</strong>
          </div>

          <div className="cluster-row">
            <span>Consumers</span>
            <strong>15</strong>
          </div>

          <div className="cluster-row">
            <span>Uptime</span>
            <strong>2d 14h</strong>
          </div>
        </div>

        <div className="dark-mode">
          <span>☾ &nbsp; Dark Mode</span>
          <div className="toggle">
            <div className="toggle-dot"></div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <button className="menu-button">☰</button>

          <div className="topbar-right">
            <div className="system-status">
              <span className="status-dot"></span>
              System Online
            </div>

            <div className="top-icon">⌕</div>
            <div className="top-icon notification">♧<span>3</span></div>

            <div className="profile">
              <div className="profile-circle">SF</div>
              <span>⌄</span>
            </div>
          </div>
        </header>

        <div className="content">
          {/* PAGE HEADER */}
          <section className="page-header">
            <div>
              <h2>Dashboard</h2>
              <p>Real-time overview of your streaming platform</p>
            </div>

            <div className="header-actions">
              <div className="time-select">
                ◷ &nbsp; Last 1 Minute &nbsp;⌄
              </div>

              <button
                className="refresh-button"
                onClick={fetchDashboardData}
              >
                ↻ &nbsp; Refresh
              </button>
            </div>
          </section>

          {/* STAT CARDS */}
          <section className="stats-grid">
            <div className="stat-card purple-card">
              <div className="stat-icon purple-icon">♒</div>

              <div className="stat-info">
                <p>Total Events</p>
                <h3>
                  {loading
                    ? "..."
                    : Number(stats.total_events || 0).toLocaleString()}
                </h3>
                <span className="positive">↑ 12.5%</span>
                <small>vs last 1 minute</small>
              </div>
            </div>

            <div className="stat-card blue-card">
              <div className="stat-icon blue-icon">◉</div>

              <div className="stat-info">
                <p>Events / sec</p>
                <h3>
                  {loading ? "..." : stats.events_per_second || 0}
                </h3>
                <span className="positive">↑ 8.7%</span>
                <small>live throughput</small>
              </div>
            </div>

            <div className="stat-card green-card">
              <div className="stat-icon green-icon">▤</div>

              <div className="stat-info">
                <p>Active Streams</p>
                <h3>
                  {loading ? "..." : stats.active_streams || 0}
                </h3>
                <span className="positive">↑ 14.3%</span>
                <small>all systems healthy</small>
              </div>
            </div>

            <div className="stat-card yellow-card">
              <div className="stat-icon yellow-icon">◷</div>

              <div className="stat-info">
                <p>Avg Latency</p>
                <h3>
                  {loading ? "..." : `${stats.processing_time || 0} ms`}
                </h3>
                <span className="positive">↓ 5.2%</span>
                <small>vs last 1 minute</small>
              </div>
            </div>

            <div className="stat-card red-card">
              <div className="stat-icon red-icon">!</div>

              <div className="stat-info">
                <p>Error Rate</p>
                <h3>0.23%</h3>
                <span className="positive">↓ 0.05%</span>
                <small>vs last 1 minute</small>
              </div>
            </div>
          </section>

          {/* CHARTS */}
          <section className="charts-grid">
            {/* EVENT CHART */}
            <div className="panel large-chart">
              <div className="panel-title">
                <div>
                  <h3>Events Per Second</h3>
                  <p>Live event processing rate</p>
                </div>

                <div className="live-control">
                  <span className="live-dot"></span>
                  LIVE
                  <span>⌄</span>
                </div>
              </div>

              <div className="line-chart">
                <div className="y-labels">
                  <span>2K</span>
                  <span>1.5K</span>
                  <span>1K</span>
                  <span>500</span>
                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="grid-line line-1"></div>
                  <div className="grid-line line-2"></div>
                  <div className="grid-line line-3"></div>
                  <div className="grid-line line-4"></div>

                  <svg
                    className="chart-svg"
                    viewBox="0 0 600 220"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="purpleGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <polygon
                      points={`0,220 ${chartData
                        .map(
                          (value, index) =>
                            `${index * (600 / (chartData.length - 1))},${
                              210 - value * 1.8
                            }`
                        )
                        .join(" ")} 600,220`}
                      fill="url(#purpleGradient)"
                    />

                    <polyline
                      points={chartData
                        .map(
                          (value, index) =>
                            `${index * (600 / (chartData.length - 1))},${
                              210 - value * 1.8
                            }`
                        )
                        .join(" ")}
                      fill="none"
                      stroke="#9b6cff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="chart-times">
                <span>16:41:00</span>
                <span>16:41:15</span>
                <span>16:41:30</span>
                <span>16:41:45</span>
                <span>16:42:00</span>
              </div>
            </div>

            {/* THROUGHPUT */}
            <div className="panel throughput-panel">
              <div className="panel-title">
                <div>
                  <h3>Throughput</h3>
                  <p>Total events processed</p>
                </div>

                <div className="time-select small">
                  Last 5 Minutes ⌄
                </div>
              </div>

              <div className="throughput-chart">
                <div className="throughput-number">
                  {Number(stats.total_events || 0).toLocaleString()}
                </div>

                <div className="mini-bars">
  {chartData.map((height, index) => (
    <div
      key={index}
      className="mini-bar"
      style={{ height: `${height}%` }}
    ></div>
  ))}
</div>
              </div>

              <div className="throughput-footer">
                <span>Events processed</span>
                <span className="positive">↑ 18.4%</span>
              </div>
            </div>
          </section>

          {/* TOPICS + LIVE EVENTS */}
          <section className="middle-grid">
            {/* TOP TOPICS */}
            <div className="panel topics-panel">
              <div className="panel-title">
                <div>
                  <h3>Top Topics</h3>
                  <p>Event distribution by topic</p>
                </div>

                <span className="view-link">View all →</span>
              </div>

              {topicData.length === 0 ? (
                <div className="empty-state">
                  No topic data available yet.
                </div>
              ) : (
                <div className="topic-list">
                  {topicData.map((item) => (
                    <div className="topic-item" key={item.topic}>
                      <div className="topic-name">
                        <span className={`topic-dot ${item.color}`}></span>
                        <span>{item.topic}</span>
                      </div>

                      <div className="topic-value">
                        <div className="topic-bar">
                          <div
                            className={`topic-bar-fill ${item.color}`}
                            style={{
                              width: `${
                                (item.count / maxTopicCount) * 100
                              }%`,
                            }}
                          ></div>
                        </div>

                        <strong>{item.count}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE EVENTS */}
            <div className="panel events-panel">
              <div className="panel-title">
                <div>
                  <h3>Live Event Stream</h3>
                  <p>Latest events received from Kafka</p>
                </div>

                <button
                  className="pause-button"
                  onClick={() => setStreaming(!streaming)}
                >
                  {streaming ? "Ⅱ Pause" : "▶ Resume"}
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>TOPIC</th>
                      <th>TYPE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="loading-row">
                          Loading live events...
                        </td>
                      </tr>
                    ) : events.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="loading-row">
                          Waiting for events...
                        </td>
                      </tr>
                    ) : (
                      events.slice(0, 6).map((event, index) => (
                        <tr key={event.id ?? index}>
                          <td>{event.time || "--:--:--"}</td>
                          <td>
                            <span className="topic-text">
                              {event.topic || "unknown"}
                            </span>
                          </td>
                          <td>{event.type || "event"}</td>
                          <td>
                            <span className="status-success">
                              ✓ {event.status || "Success"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* PIPELINE + ALERTS */}
          <section className="bottom-grid">
            <div className="panel pipeline-panel">
              <div className="panel-title">
                <div>
                  <h3>Streaming Pipeline</h3>
                  <p>Real-time data flow</p>
                </div>
              </div>

              <div className="pipeline">
                <PipelineNode icon="◈" label="Data Source" />
                <PipelineArrow />
                <PipelineNode icon="⌘" label="Producer" />
                <PipelineArrow />
                <PipelineNode icon="✣" label="Kafka Cluster" />
                <PipelineArrow />
                <PipelineNode icon="⚙" label="Processor" />
                <PipelineArrow />
                <PipelineNode icon="▥" label="Analytics" />
                <PipelineArrow />
                <PipelineNode icon="▣" label="Dashboard" />
              </div>
            </div>

            <div className="panel alerts-panel">
              <div className="panel-title">
                <div>
                  <h3>System Alerts</h3>
                  <p>Recent platform activity</p>
                </div>

                <span className="view-link">View all →</span>
              </div>

              <div className="alert-list">
                <div className="alert">
                  <span className="alert-icon success-alert">✓</span>
                  <div>
                    <strong>All systems operational</strong>
                    <small>Just now</small>
                  </div>
                  <span className="alert-label info">INFO</span>
                </div>

                <div className="alert">
                  <span className="alert-icon warning-alert">!</span>
                  <div>
                    <strong>Monitoring Kafka throughput</strong>
                    <small>2 minutes ago</small>
                  </div>
                  <span className="alert-label warning">WARN</span>
                </div>

                <div className="alert">
                  <span className="alert-icon error-alert">×</span>
                  <div>
                    <strong>No critical errors detected</strong>
                    <small>5 minutes ago</small>
                  </div>
                  <span className="alert-label error">OK</span>
                </div>
              </div>
            </div>
          </section>

          <footer className="footer">
            <span>StreamForge • Real-time Streaming Platform</span>
            <span>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function PipelineNode({ icon, label }) {
  return (
    <div className="pipeline-node">
      <div className="pipeline-icon">{icon}</div>
      <strong>{label}</strong>
      <span>
        <i></i> Healthy
      </span>
    </div>
  );
}

function PipelineArrow() {
  return <div className="pipeline-arrow">→</div>;
}

export default App;
