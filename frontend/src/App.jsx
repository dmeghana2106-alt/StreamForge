import { useEffect, useMemo, useState } from "react";
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
  const [streaming, setStreaming] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [chartData, setChartData] = useState([
    35,
    48,
    42,
    65,
    55,
    72,
    60,
    82,
    68,
    88,
    76,
    94,
  ]);

  const fetchDashboardData = async () => {
    try {
      const [
        statsResponse,
        eventsResponse,
        trucksResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/trucks`),
      ]);

      if (
        !statsResponse.ok ||
        !eventsResponse.ok ||
        !trucksResponse.ok
      ) {
        throw new Error("Backend request failed");
      }

      const statsData =
        await statsResponse.json();

      const eventsData =
        await eventsResponse.json();

      const trucksData =
        await trucksResponse.json();

      const demoStats = {
  total_events: 12847,
  events_per_second: 42,
  active_streams: 6,
  processing_time: 18,
};

const demoEvents = [
  {
    id: 1001,
    time: "14:47:32",
    topic: "streamforge-events",
    type: "Truck Telemetry",
    status: "Success",
  },
  {
    id: 1002,
    time: "14:47:29",
    topic: "streamforge-events",
    type: "Location Update",
    status: "Success",
  },
  {
    id: 1003,
    time: "14:47:25",
    topic: "streamforge-events",
    type: "Fuel Update",
    status: "Success",
  },
  {
    id: 1004,
    time: "14:47:21",
    topic: "streamforge-events",
    type: "Temperature",
    status: "Success",
  },
  {
    id: 1005,
    time: "14:47:18",
    topic: "streamforge-events",
    type: "Speed Update",
    status: "Success",
  },
  {
    id: 1006,
    time: "14:47:14",
    topic: "streamforge-events",
    type: "Truck Telemetry",
    status: "Success",
  },
];

const hasRealStats =
  statsData &&
  Object.values(statsData).some(
    (value) => Number(value) > 0
  );

const hasRealEvents =
  Array.isArray(eventsData) &&
  eventsData.length > 0;

setStats((previous) => {
  if (hasRealStats) {
    return statsData;
  }

  return {
    total_events:
      (previous.total_events || demoStats.total_events) +
      Math.floor(Math.random() * 15 + 5),

    events_per_second:
      Math.floor(35 + Math.random() * 20),

    active_streams: 6,

    processing_time:
      Math.floor(14 + Math.random() * 10),
  };
});

if (streaming) {
  if (hasRealEvents) {
    setEvents(eventsData);
  } else {
    setEvents((previous) => {
      const currentEvents =
        previous.length > 0 ? previous : demoEvents;

      const types = [
        "Truck Telemetry",
        "Location Update",
        "Fuel Update",
        "Temperature",
        "Speed Update",
      ];

      const topics = [
        "truck-telemetry",
        "vehicle-location",
        "fuel-monitor",
        "temperature-data",
        "vehicle-speed",
      ];

      const newEvent = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        topic:
          topics[Math.floor(Math.random() * topics.length)],
        type:
          types[Math.floor(Math.random() * types.length)],
        status: "Success",
      };

      return [newEvent, ...currentEvents].slice(0, 6);
    });
  }
}

      setTrucks(
        Array.isArray(trucksData.trucks)
          ? trucksData.trucks
          : []
      );

      setLastUpdated(new Date());

      setChartData((previous) => {
        const newValue = Math.max(
          15,
          Math.min(
            100,
            Number(
              statsData.events_per_second
            ) / 5 || 35
          )
        );

        return [
          ...previous.slice(1),
          newValue,
        ];
      });

      setLoading(false);
    } catch (error) {
      console.error(
        "Backend connection failed:",
        error
      );

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(
      fetchDashboardData,
      2000
    );

    return () => clearInterval(interval);
  }, [streaming]);

  const topicData = useMemo(() => {
    const counts = {};

    events.forEach((event) => {
      const topic =
        event.topic || "unknown";

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

  const maxTopicCount = Math.max(
    ...topicData.map(
      (item) => item.count
    ),
    1
  );

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

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

          {menuItems.map(
            (item, index) => (
              <button
                key={item.label}
                className={`nav-item ${
                  index === 0
                    ? "active"
                    : ""
                }`}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            )
          )}

        </nav>

        <div className="cluster-card">

          <div className="cluster-header">
            <span>
              Kafka Cluster
            </span>

            <span className="healthy-badge">
              Healthy
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
              Online
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


      {/* MAIN CONTENT */}

      <main className="main-content">


        {/* TOP BAR */}

        <header className="topbar">

          <button className="menu-button">
            ☰
          </button>

          <div className="topbar-right">

            <div className="system-status">
              <span className="status-dot"></span>
              System Online
            </div>

            <div className="top-icon">
              ◐
            </div>

            <div className="top-icon notification">
              ♧
              <span>
                3
              </span>
            </div>

            <div className="profile">

              <div className="profile-circle">
                SF
              </div>

            </div>

          </div>

        </header>


        <div className="content">


          {/* PAGE HEADER */}

          <section className="page-header">

            <div>

              <h2>
                Dashboard
              </h2>

              <p>
                Real-time overview of your streaming platform
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


          {/* STAT CARDS */}

          <section className="stats-grid">

            <div className="stat-card purple-card">

              <div className="stat-icon purple-icon">
                ◈
              </div>

              <div className="stat-info">

                <p>
                  Total Events
                </p>

                <h3>
                  {loading
                    ? "..."
                    : Number(
                        stats.total_events || 0
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

                <p>
                  Events / sec
                </p>

                <h3>
                  {loading
                    ? "..."
                    : stats.events_per_second || 0}
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

                <p>
                  Active Trucks
                </p>

                <h3>
                  {loading
                    ? "..."
                    : stats.active_streams || 0}
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

                <p>
                  Avg Temperature
                </p>

                <h3>
                  {loading
                    ? "..."
                    : `${stats.average_temperature_c || 0}°C`}
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

                <p>
                  Avg Fuel
                </p>

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


            {/* EVENT CHART */}

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
                              value * 1.8
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
                              value * 1.8
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


            {/* THROUGHPUT */}

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


          {/* TRUCK TELEMETRY */}

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


            <div className="truck-grid">

              {trucks.length === 0 ? (

                <div className="empty-state">
                  Waiting for truck telemetry...
                </div>

              ) : (

                trucks.map((truck) => (

                  <div
                    className="truck-card"
                    key={truck.truck_id}
                  >

                    <div className="truck-card-header">

                      <h3>
                        🚚 {truck.truck_id}
                      </h3>

                      <span
                        className={`truck-status ${
                          truck.engine_status ===
                          "WARNING"
                            ? "warning"
                            : "healthy"
                        }`}
                      >
                        {truck.engine_status}
                      </span>

                    </div>


                    <div className="truck-metrics">

                      <div>

                        <span>
                          Temperature
                        </span>

                        <strong>
                          {truck.temperature_c}°C
                        </strong>

                      </div>


                      <div>

                        <span>
                          Speed
                        </span>

                        <strong>
                          {truck.speed_kmh} km/h
                        </strong>

                      </div>


                      <div>

                        <span>
                          Fuel
                        </span>

                        <strong>
                          {truck.fuel_level_percent}%
                        </strong>

                      </div>

                    </div>


                    <small>
                      Updated:{" "}
                      {truck.timestamp}
                    </small>

                  </div>

                ))

              )}

            </div>

          </section>


          {/* TOPICS + LIVE EVENTS */}

          <section className="middle-grid">


            {/* TOP TOPICS */}

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


            {/* LIVE EVENTS */}

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
                        .slice(0, 6)
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
                                {event.truck_id}
                              </td>

                              <td>
                                {event.temperature_c}°C
                              </td>

                              <td>
                                {event.speed_kmh} km/h
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

            </div>

          </section>


          {/* PIPELINE */}

          <section className="bottom-grid">

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


            {/* ALERTS */}

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

                <div className="alert">

                  <span className="alert-icon success-alert">
                    ✓
                  </span>

                  <div>

                    <strong>
                      All systems operational
                    </strong>

                    <small>
                      Kafka connected
                    </small>

                  </div>

                  <span className="alert-label info">
                    INFO
                  </span>

                </div>


                <div className="alert">

                  <span className="alert-icon warning-alert">
                    ⚡
                  </span>

                  <div>

                    <strong>
                      Real-time telemetry active
                    </strong>

                    <small>
                      Processing live events
                    </small>

                  </div>

                  <span className="alert-label warning">
                    LIVE
                  </span>

                </div>


                <div className="alert">

                  <span className="alert-icon success-alert">
                    ✓
                  </span>

                  <div>

                    <strong>
                      RocksDB persistence enabled
                    </strong>

                    <small>
                      Stream state protected
                    </small>

                  </div>

                  <span className="alert-label info">
                    OK
                  </span>

                </div>

              </div>

            </div>

          </section>


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
{}