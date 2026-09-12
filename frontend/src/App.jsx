import { useEffect, useMemo, useState } from "react";
import Login from "./Login";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const menuItems = [
  { icon: "⌂", label: "Dashboard" },
  { icon: "◉", label: "Live Streams" },
  { icon: "▣", label: "Topics" },
  { icon: "⌘", label: "Pipelines" },
  { icon: "◌", label: "Consumers" },
  { icon: "◍", label: "Analytics" },
  { icon: "♧", label: "Alerts" },
  { icon: "⚙", label: "Settings" },
];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [stats, setStats] = useState({
    total_events: 0,
    events_per_second: 0,
    active_streams: 0,
    processing_time: 0,
    average_temperature_c: 0,
    average_speed_kmh: 0,
    average_fuel_level_percent: 0,
  });

  const [events, setEvents] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [windows, setWindows] = useState({
    active: [],
    completed: [],
  });

  const [streaming, setStreaming] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [backendConnected, setBackendConnected] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(new Date());

  const [chartData, setChartData] =
    useState(Array(12).fill(0));

  /*
   * ==========================================
   * FETCH REAL BACKEND DATA
   * ==========================================
   */

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        `${API_URL}/dashboard`
      );

      if (!response.ok) {
        throw new Error(
          `Backend request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.stats) {
        setStats({
          total_events:
            data.stats.total_events ?? 0,

          events_per_second:
            data.stats.events_per_second ?? 0,

          active_streams:
            data.stats.active_streams ?? 0,

          processing_time:
            data.stats.processing_time ?? 0,

          average_temperature_c:
            data.stats.average_temperature_c ?? 0,

          average_speed_kmh:
            data.stats.average_speed_kmh ?? 0,

          average_fuel_level_percent:
            data.stats
              .average_fuel_level_percent ?? 0,
        });
      }

      if (data.trucks) {
        setTrucks(
          Array.isArray(data.trucks.items)
            ? data.trucks.items
            : []
        );
      }

      if (Array.isArray(data.events)) {
        setEvents(data.events);
      }

      if (data.alerts) {
        setAlerts(
          Array.isArray(data.alerts.items)
            ? data.alerts.items
            : []
        );
      }

      if (data.windows) {
        setWindows({
          active: Array.isArray(
            data.windows.active
          )
            ? data.windows.active
            : [],

          completed: Array.isArray(
            data.windows.completed
          )
            ? data.windows.completed
            : [],
        });
      }

      setChartData((previous) => {
        const value = Math.max(
          0,
          Number(
            data.stats?.events_per_second
          ) || 0
        );

        return [
          ...previous.slice(1),
          value,
        ];
      });

      setBackendConnected(true);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error(
        "Backend connection failed:",
        error
      );

      setBackendConnected(false);
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * LIVE POLLING
   * ==========================================
   */

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    fetchDashboardData();

    const interval = setInterval(
      fetchDashboardData,
      2000
    );

    return () =>
      clearInterval(interval);
  }, [loggedIn]);

  /*
   * ==========================================
   * TOPICS
   * ==========================================
   */

  const topicData = useMemo(() => {
    const counts = {};

    events.forEach((event) => {
      const topic =
        event.topic ||
        "streamforge-events";

      counts[topic] =
        (counts[topic] || 0) + 1;
    });

    const colors = [
      "purple",
      "blue",
      "green",
      "yellow",
      "red",
    ];

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(
        ([topic, count], index) => ({
          topic,
          count,
          color: colors[index],
        })
      );
  }, [events]);

  /*
   * ==========================================
   * LOGIN
   * ==========================================
   */

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

  /*
   * ==========================================
   * PAGE TITLE
   * ==========================================
   */

  const pageDescriptions = {
    Dashboard:
      "Real-time overview of your streaming platform",

    "Live Streams":
      "Monitor live truck telemetry and Kafka events",

    Topics:
      "Monitor Kafka topics and event distribution",

    Pipelines:
      "View the real-time StreamForge processing pipeline",

    Consumers:
      "Monitor Kafka consumer and stream processor status",

    Analytics:
      "Real-time telemetry analytics and five-minute windows",

    Alerts:
      "Monitor anomaly detection and system alerts",

    Settings:
      "StreamForge platform configuration",
  };

  /*
   * ==========================================
   * RENDER PAGE
   * ==========================================
   */

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <DashboardPage
            stats={stats}
            events={events}
            trucks={trucks}
            alerts={alerts}
            windows={windows}
            loading={loading}
            streaming={streaming}
            setStreaming={setStreaming}
            chartData={chartData}
            topicData={topicData}
            fetchDashboardData={
              fetchDashboardData
            }
          />
        );

      case "Live Streams":
        return (
          <LiveStreamsPage
            trucks={trucks}
            events={events}
            loading={loading}
            streaming={streaming}
            setStreaming={setStreaming}
          />
        );

      case "Topics":
        return (
          <TopicsPage
            topicData={topicData}
            events={events}
          />
        );

      case "Pipelines":
        return <PipelinesPage />;

      case "Consumers":
        return (
          <ConsumersPage
            stats={stats}
            backendConnected={
              backendConnected
            }
          />
        );

      case "Analytics":
        return (
          <AnalyticsPage
            stats={stats}
            windows={windows}
          />
        );

      case "Alerts":
        return (
          <AlertsPage
            alerts={alerts}
          />
        );

      case "Settings":
        return (
          <SettingsPage
            backendConnected={
              backendConnected
            }
          />
        );

      default:
        return null;
    }
  };

  /*
   * ==========================================
   * MAIN APPLICATION
   * ==========================================
   */

  return (
    <div className="app-shell">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            ⚡
          </div>

          <div>
            <h1>
              STREAM<span>FORGE</span>
            </h1>

            <p>
              Real-time Streaming Platform
            </p>
          </div>

        </div>

        <nav className="sidebar-nav">

          {menuItems.map((item) => (

            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(
                  item.label
                )
              }
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>

          ))}

        </nav>

        {/* KAFKA CLUSTER */}

        <div className="cluster-card">

          <div className="cluster-header">

            <span>
              Kafka Cluster
            </span>

            <span className="healthy-badge">
              {backendConnected
                ? "Healthy"
                : "Offline"}
            </span>

          </div>

          <div className="cluster-row">

            <span>
              Active Trucks
            </span>

            <strong>
              {stats.active_streams || 0}
            </strong>

          </div>

          <div className="cluster-row">

            <span>
              Topic
            </span>

            <strong>
              streamforge-events
            </strong>

          </div>

          <div className="cluster-row">

            <span>
              Events
            </span>

            <strong>
              {Number(
                stats.total_events || 0
              ).toLocaleString()}
            </strong>

          </div>

          <div className="cluster-row">

            <span>
              Status
            </span>

            <strong>
              {backendConnected
                ? "Online"
                : "Offline"}
            </strong>

          </div>

        </div>

        <div className="dark-mode">

          <span>
            ☾ &nbsp; Dark Mode
          </span>

          <div className="toggle">
            <div className="toggle-dot"></div>
          </div>

        </div>

      </aside>


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <button className="menu-button">
            ☰
          </button>

          <div className="topbar-right">

            <div className="system-status">

              <span className="status-dot"></span>

              {backendConnected
                ? "System Online"
                : "Backend Offline"}

            </div>

            <div className="top-icon">
              ◐
            </div>

            <div className="top-icon notification">

              ♧

              <span>
                {alerts.length}
              </span>

            </div>

            <div className="profile">

              <div className="profile-circle">
                SF
              </div>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <div className="content">

          <section className="page-header">

            <div>

              <h2>
                {activePage}
              </h2>

              <p>
                {
                  pageDescriptions[
                    activePage
                  ]
                }
              </p>

            </div>

            <div className="header-actions">

              <div className="time-select">
                ◷ &nbsp; Live Streaming
              </div>

              <button
                className="refresh-button"
                onClick={
                  fetchDashboardData
                }
              >
                ↻ &nbsp; Refresh
              </button>

            </div>

          </section>

          {renderPage()}

          <footer className="footer">

            <span>
              StreamForge • Real-time Streaming Platform
            </span>

            <span>
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString()}
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}


/* =====================================================
   DASHBOARD PAGE
===================================================== */

function DashboardPage({
  stats,
  events,
  trucks,
  alerts,
  windows,
  loading,
  streaming,
  setStreaming,
  chartData,
  topicData,
  fetchDashboardData,
}) {
  const maxTopicCount = Math.max(
    ...topicData.map(
      (item) => item.count
    ),
    1
  );

  return (
    <>
      {/* STAT CARDS */}

      <section className="stats-grid">

        <div className="stat-card purple-card">

          <div className="stat-icon purple-icon">
            ◈
          </div>

          <div className="stat-info">

            <p>Total Events</p>

            <h3>
              {loading
                ? "..."
                : Number(
                    stats.total_events ||
                      0
                  ).toLocaleString()}
            </h3>

            <small>
              Kafka telemetry processed
            </small>

          </div>

        </div>


        <div className="stat-card blue-card">

          <div className="stat-icon blue-icon">
            ◉
          </div>

          <div className="stat-info">

            <p>Events / sec</p>

            <h3>
              {loading
                ? "..."
                : stats.events_per_second ||
                  0}
            </h3>

            <small>
              Live throughput
            </small>

          </div>

        </div>


        <div className="stat-card green-card">

          <div className="stat-icon green-icon">
            🚚
          </div>

          <div className="stat-info">

            <p>Active Trucks</p>

            <h3>
              {loading
                ? "..."
                : stats.active_streams ||
                  0}
            </h3>

            <small>
              Currently sending telemetry
            </small>

          </div>

        </div>


        <div className="stat-card yellow-card">

          <div className="stat-icon yellow-icon">
            🌡
          </div>

          <div className="stat-info">

            <p>Avg Temperature</p>

            <h3>
              {loading
                ? "..."
                : `${
                    stats.average_temperature_c ||
                    0
                  }°C`}
            </h3>

            <small>
              Engine temperature
            </small>

          </div>

        </div>


        <div className="stat-card red-card">

          <div className="stat-icon red-icon">
            ⛽
          </div>

          <div className="stat-info">

            <p>Avg Fuel</p>

            <h3>
              {loading
                ? "..."
                : `${
                    stats.average_fuel_level_percent ||
                    0
                  }%`}
            </h3>

            <small>
              Fleet fuel level
            </small>

          </div>

        </div>

      </section>


      {/* CHARTS */}

      <section className="charts-grid">

        <div className="panel large-chart">

          <div className="panel-title">

            <div>

              <h3>
                Events Per Second
              </h3>

              <p>
                Live Kafka event processing rate
              </p>

            </div>

            <div className="live-control">

              <span className="live-dot"></span>

              LIVE

            </div>

          </div>


          <div className="line-chart">

            <div className="chart-area">

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

                    <stop
                      offset="0%"
                      stopColor="#8b5cf6"
                      stopOpacity="0.35"
                    />

                    <stop
                      offset="100%"
                      stopColor="#8b5cf6"
                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>


                <polygon
                  points={`0,220 ${chartData
                    .map(
                      (
                        value,
                        index
                      ) =>
                        `${
                          index *
                          (600 /
                            (chartData.length -
                              1))
                        },${
                          210 -
                          Math.min(
                            value * 1.8,
                            180
                          )
                        }`
                    )
                    .join(
                      " "
                    )} 600,220`}
                  fill="url(#purpleGradient)"
                />


                <polyline
                  points={chartData
                    .map(
                      (
                        value,
                        index
                      ) =>
                        `${
                          index *
                          (600 /
                            (chartData.length -
                              1))
                        },${
                          210 -
                          Math.min(
                            value * 1.8,
                            180
                          )
                        }`
                    )
                    .join(
                      " "
                    )}
                  fill="none"
                  stroke="#9b6cff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </div>

          </div>

        </div>


        <div className="panel throughput-panel">

          <div className="panel-title">

            <div>

              <h3>
                Throughput
              </h3>

              <p>
                Total events processed
              </p>

            </div>

          </div>


          <div className="throughput-chart">

            <div className="throughput-number">

              {Number(
                stats.total_events || 0
              ).toLocaleString()}

            </div>

          </div>


          <div className="throughput-footer">

            <span>
              Events processed
            </span>

            <span className="positive">
              LIVE
            </span>

          </div>

        </div>

      </section>


      {/* TRUCKS */}

      <section className="panel truck-panel">

        <div className="panel-title">

          <div>

            <h3>
              Live Truck Telemetry
            </h3>

            <p>
              Latest real-time data received from Kafka
            </p>

          </div>

          <span className="healthy-badge">
            {trucks.length} Active
          </span>

        </div>


        <TruckCards
          trucks={trucks}
        />

      </section>


      {/* TOPICS + EVENTS */}

      <section className="middle-grid">

        <TopicPanel
          topicData={topicData}
          maxTopicCount={
            maxTopicCount
          }
        />

        <EventsPanel
          events={events}
          loading={loading}
          streaming={streaming}
          setStreaming={setStreaming}
        />

      </section>


      {/* PIPELINE + ALERTS */}

      <section className="bottom-grid">

        <PipelinePanel />

        <AlertPanel
          alerts={alerts}
        />

      </section>


      {/* WINDOWS */}

      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              Five-Minute Windows
            </h3>

            <p>
              Real-time window processing state
            </p>

          </div>

          <span className="healthy-badge">
            {windows.active.length} Active
          </span>

        </div>


        <WindowCards
          windows={windows.active}
        />

      </section>

    </>
  );
}


/* =====================================================
   LIVE STREAMS PAGE
===================================================== */

function LiveStreamsPage({
  trucks,
  events,
  loading,
  streaming,
  setStreaming,
}) {
  return (
    <>

      <section className="stats-grid">

        <div className="stat-card green-card">

          <div className="stat-icon green-icon">
            🚚
          </div>

          <div className="stat-info">

            <p>Active Trucks</p>

            <h3>
              {trucks.length}
            </h3>

            <small>
              Live telemetry sources
            </small>

          </div>

        </div>


        <div className="stat-card blue-card">

          <div className="stat-icon blue-icon">
            ◉
          </div>

          <div className="stat-info">

            <p>Live Events</p>

            <h3>
              {events.length}
            </h3>

            <small>
              Recent Kafka events
            </small>

          </div>

        </div>

      </section>


      <section className="panel truck-panel">

        <div className="panel-title">

          <div>

            <h3>
              Live Truck Streams
            </h3>

            <p>
              Real-time telemetry from Kafka
            </p>

          </div>

          <button
            className="pause-button"
            onClick={() =>
              setStreaming(
                !streaming
              )
            }
          >
            {streaming
              ? "Ⅱ Pause"
              : "▶ Resume"}
          </button>

        </div>

        <TruckCards
          trucks={trucks}
        />

      </section>


      <section className="panel events-panel">

        <div className="panel-title">

          <div>

            <h3>
              Kafka Event Stream
            </h3>

            <p>
              Latest processed telemetry
            </p>

          </div>

        </div>

        <EventsTable
          events={events}
          loading={loading}
        />

      </section>

    </>
  );
}


/* =====================================================
   TOPICS PAGE
===================================================== */

function TopicsPage({
  topicData,
  events,
}) {
  const maxCount = Math.max(
    ...topicData.map(
      (item) => item.count
    ),
    1
  );

  return (
    <>

      <section className="stats-grid">

        <div className="stat-card purple-card">

          <div className="stat-icon purple-icon">
            ▣
          </div>

          <div className="stat-info">

            <p>Kafka Topics</p>

            <h3>
              1
            </h3>

            <small>
              Active application topic
            </small>

          </div>

        </div>


        <div className="stat-card blue-card">

          <div className="stat-icon blue-icon">
            ◉
          </div>

          <div className="stat-info">

            <p>Events Available</p>

            <h3>
              {events.length}
            </h3>

            <small>
              Recent processed events
            </small>

          </div>

        </div>

      </section>


      <section className="panel topics-panel">

        <div className="panel-title">

          <div>

            <h3>
              Kafka Topics
            </h3>

            <p>
              Event distribution from StreamForge
            </p>

          </div>

        </div>


        <div className="topic-list">

          <div className="topic-item">

            <div className="topic-name">

              <span className="topic-dot purple"></span>

              <span>
                streamforge-events
              </span>

            </div>

            <div className="topic-value">

              <div className="topic-bar">

                <div
                  className="topic-bar-fill purple"
                  style={{
                    width: "100%",
                  }}
                ></div>

              </div>

              <strong>
                {events.length}
              </strong>

            </div>

          </div>


          {topicData.map(
            (item) => (

              <div
                className="topic-item"
                key={item.topic}
              >

                <div className="topic-name">

                  <span
                    className={`topic-dot ${item.color}`}
                  ></span>

                  <span>
                    {item.topic}
                  </span>

                </div>

                <div className="topic-value">

                  <div className="topic-bar">

                    <div
                      className={`topic-bar-fill ${item.color}`}
                      style={{
                        width: `${
                          (item.count /
                            maxCount) *
                          100
                        }%`,
                      }}
                    ></div>

                  </div>

                  <strong>
                    {item.count}
                  </strong>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              Topic Configuration
            </h3>

            <p>
              Current StreamForge Kafka configuration
            </p>

          </div>

        </div>


        <div className="truck-grid">

          <InfoCard
            title="Topic"
            value="streamforge-events"
          />

          <InfoCard
            title="Partitions"
            value="3"
          />

          <InfoCard
            title="Replication"
            value="1"
          />

          <InfoCard
            title="Message Format"
            value="JSON"
          />

        </div>

      </section>

    </>
  );
}


/* =====================================================
   PIPELINES PAGE
===================================================== */

function PipelinesPage() {
  return (
    <>

      <section className="panel pipeline-panel">

        <div className="panel-title">

          <div>

            <h3>
              StreamForge Pipeline
            </h3>

            <p>
              Complete real-time telemetry data flow
            </p>

          </div>

          <span className="healthy-badge">
            ACTIVE
          </span>

        </div>


        <div className="pipeline">

          <PipelineNode
            icon="🚚"
            label="Truck Simulator"
          />

          <PipelineArrow />

          <PipelineNode
            icon="📤"
            label="Kafka Producer"
          />

          <PipelineArrow />

          <PipelineNode
            icon="⚡"
            label="Kafka"
          />

          <PipelineArrow />

          <PipelineNode
            icon="⚙"
            label="Processor"
          />

          <PipelineArrow />

          <PipelineNode
            icon="📊"
            label="Analytics"
          />

          <PipelineArrow />

          <PipelineNode
            icon="🖥"
            label="Dashboard"
          />

        </div>

      </section>


      <section className="stats-grid">

        <InfoStat
          title="Input"
          value="Kafka"
          subtitle="streamforge-events"
        />

        <InfoStat
          title="Processing"
          value="Python"
          subtitle="Stream Processor"
        />

        <InfoStat
          title="State"
          value="RocksDB"
          subtitle="Persistent state"
        />

        <InfoStat
          title="API"
          value="FastAPI"
          subtitle="REST endpoints"
        />

      </section>

    </>
  );
}


/* =====================================================
   CONSUMERS PAGE
===================================================== */

function ConsumersPage({
  stats,
  backendConnected,
}) {
  return (
    <>

      <section className="stats-grid">

        <InfoStat
          title="Consumer Group"
          value="streamforge-processor"
          subtitle="Kafka consumer group"
        />

        <InfoStat
          title="Active Streams"
          value={
            stats.active_streams
          }
          subtitle="Truck telemetry streams"
        />

        <InfoStat
          title="Events / Sec"
          value={
            stats.events_per_second
          }
          subtitle="Current processing rate"
        />

        <InfoStat
          title="Status"
          value={
            backendConnected
              ? "RUNNING"
              : "OFFLINE"
          }
          subtitle="Stream processor"
        />

      </section>


      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              Kafka Consumer
            </h3>

            <p>
              StreamForge telemetry processing consumer
            </p>

          </div>

          <span className="healthy-badge">
            {backendConnected
              ? "Healthy"
              : "Offline"}
          </span>

        </div>


        <div className="truck-grid">

          <InfoCard
            title="Topic"
            value="streamforge-events"
          />

          <InfoCard
            title="Group ID"
            value="streamforge-processor"
          />

          <InfoCard
            title="Offset Policy"
            value="earliest"
          />

          <InfoCard
            title="Auto Commit"
            value="Enabled"
          />

        </div>

      </section>

    </>
  );
}


/* =====================================================
   ANALYTICS PAGE
===================================================== */

function AnalyticsPage({
  stats,
  windows,
}) {
  return (
    <>

      <section className="stats-grid">

        <div className="stat-card purple-card">

          <div className="stat-icon purple-icon">
            ∑
          </div>

          <div className="stat-info">

            <p>Total Events</p>

            <h3>
              {Number(
                stats.total_events || 0
              ).toLocaleString()}
            </h3>

            <small>
              Processed telemetry
            </small>

          </div>

        </div>


        <div className="stat-card blue-card">

          <div className="stat-icon blue-icon">
            ⚡
          </div>

          <div className="stat-info">

            <p>Events / sec</p>

            <h3>
              {stats.events_per_second}
            </h3>

            <small>
              Current throughput
            </small>

          </div>

        </div>


        <div className="stat-card yellow-card">

          <div className="stat-icon yellow-icon">
            🌡
          </div>

          <div className="stat-info">

            <p>Avg Temperature</p>

            <h3>
              {stats.average_temperature_c}°C
            </h3>

            <small>
              Fleet average
            </small>

          </div>

        </div>


        <div className="stat-card red-card">

          <div className="stat-icon red-icon">
            ⛽
          </div>

          <div className="stat-info">

            <p>Avg Fuel</p>

            <h3>
              {stats.average_fuel_level_percent}%
            </h3>

            <small>
              Fleet average
            </small>

          </div>

        </div>

      </section>


      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              Five-Minute Analytics Windows
            </h3>

            <p>
              Windowed telemetry aggregation
            </p>

          </div>

          <span className="healthy-badge">
            {windows.active.length} Active
          </span>

        </div>


        <WindowCards
          windows={windows.active}
        />

      </section>


      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              Completed Windows
            </h3>

            <p>
              Recently completed five-minute windows
            </p>

          </div>

        </div>


        {windows.completed.length ===
        0 ? (

          <div className="empty-state">
            No completed windows yet.
            Keep the simulator running.
          </div>

        ) : (

          <div className="truck-grid">

            {windows.completed.map(
              (window, index) => (

                <div
                  className="truck-card"
                  key={`${window.truck_id}-${index}`}
                >

                  <div className="truck-card-header">

                    <h3>
                      ⏱{" "}
                      {window.truck_id}
                    </h3>

                    <span className="truck-status healthy">
                      COMPLETED
                    </span>

                  </div>

                  <div className="truck-metrics">

                    <div>

                      <span>
                        Events
                      </span>

                      <strong>
                        {window.event_count}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Avg Temp
                      </span>

                      <strong>
                        {
                          window.average_temperature_c
                        }°C
                      </strong>

                    </div>

                    <div>

                      <span>
                        Duration
                      </span>

                      <strong>
                        5 min
                      </strong>

                    </div>

                  </div>

                  <small>
                    {
                      window.window_start
                    } →{" "}
                    {
                      window.window_end
                    }
                  </small>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </>
  );
}


/* =====================================================
   ALERTS PAGE
===================================================== */

function AlertsPage({
  alerts,
}) {
  return (
    <>

      <section className="stats-grid">

        <InfoStat
          title="Total Alerts"
          value={alerts.length}
          subtitle="Detected anomalies"
        />

        <InfoStat
          title="High Severity"
          value={
            alerts.filter(
              (alert) =>
                alert.severity ===
                "HIGH"
            ).length
          }
          subtitle="High priority alerts"
        />

        <InfoStat
          title="Medium Severity"
          value={
            alerts.filter(
              (alert) =>
                alert.severity ===
                "MEDIUM"
            ).length
          }
          subtitle="Medium priority alerts"
        />

      </section>


      <section className="panel alerts-panel">

        <div className="panel-title">

          <div>

            <h3>
              Anomaly Detection Alerts
            </h3>

            <p>
              Real alerts generated by the backend
            </p>

          </div>

        </div>


        {alerts.length === 0 ? (

          <div className="empty-state">
            No anomalies detected yet.
            Keep the truck simulator running.
          </div>

        ) : (

          <div className="alert-list">

            {alerts.map(
              (alert, index) => (

                <div
                  className="alert"
                  key={`${alert.timestamp}-${index}`}
                >

                  <span className="alert-icon warning-alert">
                    ⚠
                  </span>

                  <div>

                    <strong>
                      {alert.type}
                    </strong>

                    <small>
                      Truck{" "}
                      {alert.truck_id}
                      {" — "}
                      {alert.message}
                    </small>

                  </div>

                  <span className="alert-label warning">
                    {alert.severity}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </>
  );
}


/* =====================================================
   SETTINGS PAGE
===================================================== */

function SettingsPage({
  backendConnected,
}) {
  return (
    <>

      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              StreamForge Settings
            </h3>

            <p>
              Current application configuration
            </p>

          </div>

        </div>


        <div className="truck-grid">

          <InfoCard
            title="API Server"
            value="127.0.0.1:8000"
          />

          <InfoCard
            title="Frontend"
            value="localhost:5173"
          />

          <InfoCard
            title="Kafka Topic"
            value="streamforge-events"
          />

          <InfoCard
            title="Backend Status"
            value={
              backendConnected
                ? "Connected"
                : "Disconnected"
            }
          />

          <InfoCard
            title="Refresh Interval"
            value="2 seconds"
          />

          <InfoCard
            title="State Store"
            value="RocksDB"
          />

        </div>

      </section>


      <section className="panel">

        <div className="panel-title">

          <div>

            <h3>
              Processing Configuration
            </h3>

            <p>
              Stream processing components
            </p>

          </div>

        </div>


        <div className="truck-grid">

          <InfoCard
            title="Window Size"
            value="5 minutes"
          />

          <InfoCard
            title="Temperature Limit"
            value="100°C"
          />

          <InfoCard
            title="Speed Limit"
            value="90 km/h"
          />

          <InfoCard
            title="Fuel Limit"
            value="20%"
          />

        </div>

      </section>

    </>
  );
}


/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function TruckCards({
  trucks,
}) {
  return (
    <div className="truck-grid">

      {trucks.length === 0 ? (

        <div className="empty-state">
          Waiting for truck telemetry...
        </div>

      ) : (

        trucks.map(
          (truck) => (

            <div
              className="truck-card"
              key={
                truck.truck_id
              }
            >

              <div className="truck-card-header">

                <h3>
                  🚚{" "}
                  {truck.truck_id}
                </h3>

                <span
                  className={`truck-status ${
                    truck.engine_status ===
                    "WARNING"
                      ? "warning"
                      : "healthy"
                  }`}
                >
                  {
                    truck.engine_status
                  }
                </span>

              </div>


              <div className="truck-metrics">

                <div>

                  <span>
                    Temperature
                  </span>

                  <strong>
                    {
                      truck.temperature_c
                    }°C
                  </strong>

                </div>


                <div>

                  <span>
                    Speed
                  </span>

                  <strong>
                    {
                      truck.speed_kmh
                    } km/h
                  </strong>

                </div>


                <div>

                  <span>
                    Fuel
                  </span>

                  <strong>
                    {
                      truck.fuel_level_percent
                    }%
                  </strong>

                </div>

              </div>


              <small>
                Updated:{" "}
                {
                  truck.timestamp
                }
              </small>

            </div>

          )
        )

      )}

    </div>
  );
}


function EventsPanel({
  events,
  loading,
  streaming,
  setStreaming,
}) {
  return (
    <div className="panel events-panel">

      <div className="panel-title">

        <div>

          <h3>
            Live Event Stream
          </h3>

          <p>
            Latest events received from Kafka
          </p>

        </div>


        <button
          className="pause-button"
          onClick={() =>
            setStreaming(
              !streaming
            )
          }
        >
          {streaming
            ? "Ⅱ Pause"
            : "▶ Resume"}
        </button>

      </div>


      <EventsTable
        events={events}
        loading={loading}
      />

    </div>
  );
}


function EventsTable({
  events,
  loading,
}) {
  return (
    <div className="table-container">

      <table>

        <thead>

          <tr>

            <th>
              TRUCK
            </th>

            <th>
              TEMPERATURE
            </th>

            <th>
              SPEED
            </th>

            <th>
              STATUS
            </th>

          </tr>

        </thead>


        <tbody>

          {loading ? (

            <tr>

              <td
                colSpan="4"
                className="loading-row"
              >
                Loading live events...
              </td>

            </tr>

          ) : events.length === 0 ? (

            <tr>

              <td
                colSpan="4"
                className="loading-row"
              >
                Waiting for events...
              </td>

            </tr>

          ) : (

            events
              .slice(0, 10)
              .map(
                (
                  event,
                  index
                ) => (

                  <tr
                    key={
                      event.id ??
                      index
                    }
                  >

                    <td>
                      {
                        event.truck_id
                      }
                    </td>

                    <td>
                      {
                        event.temperature_c
                      }°C
                    </td>

                    <td>
                      {
                        event.speed_kmh
                      } km/h
                    </td>

                    <td>

                      <span className="status-success">

                        ✓{" "}

                        {
                          event.engine_status
                        }

                      </span>

                    </td>

                  </tr>

                )
              )

          )}

        </tbody>

      </table>

    </div>
  );
}


function TopicPanel({
  topicData,
  maxTopicCount,
}) {
  return (
    <div className="panel topics-panel">

      <div className="panel-title">

        <div>

          <h3>
            Top Topics
          </h3>

          <p>
            Event distribution
          </p>

        </div>

      </div>


      {topicData.length === 0 ? (

        <div className="empty-state">
          No topic data available yet.
        </div>

      ) : (

        <div className="topic-list">

          {topicData.map(
            (item) => (

              <div
                className="topic-item"
                key={
                  item.topic
                }
              >

                <div className="topic-name">

                  <span
                    className={`topic-dot ${item.color}`}
                  ></span>

                  <span>
                    {item.topic}
                  </span>

                </div>


                <div className="topic-value">

                  <div className="topic-bar">

                    <div
                      className={`topic-bar-fill ${item.color}`}
                      style={{
                        width: `${
                          (item.count /
                            maxTopicCount) *
                          100
                        }%`,
                      }}
                    ></div>

                  </div>

                  <strong>
                    {item.count}
                  </strong>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}


function PipelinePanel() {
  return (
    <div className="panel pipeline-panel">

      <div className="panel-title">

        <div>

          <h3>
            Streaming Pipeline
          </h3>

          <p>
            Real-time data flow
          </p>

        </div>

      </div>


      <div className="pipeline">

        <PipelineNode
          icon="🚚"
          label="Truck Simulator"
        />

        <PipelineArrow />

        <PipelineNode
          icon="📤"
          label="Kafka Producer"
        />

        <PipelineArrow />

        <PipelineNode
          icon="⚡"
          label="Kafka"
        />

        <PipelineArrow />

        <PipelineNode
          icon="⚙"
          label="Processor"
        />

        <PipelineArrow />

        <PipelineNode
          icon="📊"
          label="Analytics"
        />

        <PipelineArrow />

        <PipelineNode
          icon="🖥"
          label="Dashboard"
        />

      </div>

    </div>
  );
}


function AlertPanel({
  alerts,
}) {
  const recentAlerts =
    alerts.slice(0, 3);

  return (
    <div className="panel alerts-panel">

      <div className="panel-title">

        <div>

          <h3>
            System Alerts
          </h3>

          <p>
            Recent platform activity
          </p>

        </div>

      </div>


      <div className="alert-list">

        {recentAlerts.length === 0 ? (

          <div className="alert">

            <span className="alert-icon success-alert">
              ✓
            </span>

            <div>

              <strong>
                All systems operational
              </strong>

              <small>
                No anomalies detected
              </small>

            </div>

            <span className="alert-label info">
              OK
            </span>

          </div>

        ) : (

          recentAlerts.map(
            (alert, index) => (

              <div
                className="alert"
                key={
                  `${alert.timestamp}-${index}`
                }
              >

                <span className="alert-icon warning-alert">
                  ⚠
                </span>

                <div>

                  <strong>
                    {alert.type}
                  </strong>

                  <small>
                    Truck{" "}
                    {
                      alert.truck_id
                    }{" "}
                    —{" "}
                    {
                      alert.message
                    }
                  </small>

                </div>

                <span className="alert-label warning">
                  {
                    alert.severity
                  }
                </span>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}


function WindowCards({
  windows,
}) {
  return (
    <div className="truck-grid">

      {windows.length === 0 ? (

        <div className="empty-state">
          Waiting for active windows...
        </div>

      ) : (

        windows.map(
          (window) => (

            <div
              className="truck-card"
              key={
                window.truck_id
              }
            >

              <div className="truck-card-header">

                <h3>
                  ⏱{" "}
                  {
                    window.truck_id
                  }
                </h3>

                <span className="truck-status healthy">
                  ACTIVE
                </span>

              </div>


              <div className="truck-metrics">

                <div>

                  <span>
                    Events
                  </span>

                  <strong>
                    {
                      window.event_count
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Avg Temp
                  </span>

                  <strong>
                    {
                      window.average_temperature_c
                    }°C
                  </strong>

                </div>


                <div>

                  <span>
                    Duration
                  </span>

                  <strong>
                    5 min
                  </strong>

                </div>

              </div>


              <small>
                {
                  window.window_start
                } →{" "}
                {
                  window.window_end
                }
              </small>

            </div>

          )
        )

      )}

    </div>
  );
}


function InfoCard({
  title,
  value,
}) {
  return (
    <div className="truck-card">

      <div className="truck-card-header">

        <h3>
          {title}
        </h3>

        <span className="truck-status healthy">
          ACTIVE
        </span>

      </div>

      <div className="truck-metrics">

        <div>

          <strong>
            {value}
          </strong>

        </div>

      </div>

    </div>
  );
}


function InfoStat({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="stat-card purple-card">

      <div className="stat-icon purple-icon">
        ◈
      </div>

      <div className="stat-info">

        <p>
          {title}
        </p>

        <h3>
          {value}
        </h3>

        <small>
          {subtitle}
        </small>

      </div>

    </div>
  );
}


function PipelineNode({
  icon,
  label,
}) {
  return (
    <div className="pipeline-node">

      <div className="pipeline-icon">
        {icon}
      </div>

      <strong>
        {label}
      </strong>

      <span>

        <i></i>

        Healthy

      </span>

    </div>
  );
}


function PipelineArrow() {
  return (
    <div className="pipeline-arrow">
      →
    </div>
  );
}


export default App;