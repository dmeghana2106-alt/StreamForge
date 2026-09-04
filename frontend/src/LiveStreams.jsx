import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function LiveStreams() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrucks = async () => {
    try {
      const response = await fetch(`${API_URL}/trucks`);

      if (!response.ok) {
        throw new Error("Failed to fetch trucks" );
      }

      const data = await response.json();

      setTrucks(data.trucks || []);
      setLoading(false);
    } catch (error) {
      console.error("Truck fetch failed:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();

    const interval = setInterval(fetchTrucks, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="content">
      <section className="page-header">
        <div>
          <h2>Live Streams</h2>
          <p>Real-time truck telemetry streams from Kafka</p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchTrucks}
        >
          ↻ Refresh
        </button>
      </section>

      <section className="live-streams-grid">
        {loading ? (
          <div className="empty-state">
            Loading live truck streams...
          </div>
        ) : trucks.length === 0 ? (
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
                <div>
                  <span className="live-indicator"></span>
                  <span className="live-text">LIVE</span>
                </div>

                <span
                  className={
                    truck.engine_status === "WARNING"
                      ? "warning-status"
                      : "running-status"
                  }
                >
                  {truck.engine_status}
                </span>
              </div>

              <h3>{truck.truck_id}</h3>

              <div className="truck-metrics">
                <div className="truck-metric">
                  <span>Temperature</span>
                  <strong>
                    {truck.temperature_c}°C
                  </strong>
                </div>

                <div className="truck-metric">
                  <span>Speed</span>
                  <strong>
                    {truck.speed_kmh} km/h
                  </strong>
                </div>

                <div className="truck-metric">
                  <span>Fuel Level</span>
                  <strong>
                    {truck.fuel_level_percent}%
                  </strong>
                </div>
              </div>

              <div className="truck-footer">
                <span>Last Update</span>

                <strong>
                  {truck.timestamp
                    ? new Date(
                        truck.timestamp
                      ).toLocaleTimeString()
                    : "--"}
                </strong>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default LiveStreams;