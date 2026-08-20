import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>StreamForge</h1>
          <p>Real-Time Data Streaming Dashboard</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      <main className="dashboard">
        <section className="cards">
          <div className="card">
            <h3>Messages Received</h3>
            <p className="number">0</p>
          </div>

          <div className="card">
            <h3>Messages Processed</h3>
            <p className="number">0</p>
          </div>

          <div className="card">
            <h3>Active Streams</h3>
            <p className="number">0</p>
          </div>

          <div className="card">
            <h3>Kafka Status</h3>
            <p className="online">● Connected</p>
          </div>
        </section>

        <section className="panel">
          <h2>Live Stream</h2>

          <div className="stream-box">
            <p>No streaming data available</p>
            <span>Waiting for Kafka messages...</span>
          </div>
        </section>

        <section className="panel">
          <h2>Recent Events</h2>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>--:--</td>
                <td>Waiting for events</td>
                <td>Idle</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
