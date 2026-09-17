import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "streamforge123") {
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .sf-login {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(circle at 20% 50%, rgba(105, 45, 220, 0.18), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(45, 180, 255, 0.10), transparent 30%),
            #050816;
          color: white;
          display: flex;
          overflow: hidden;
          font-family: Inter, Arial, sans-serif;
          position: relative;
        }

        /* ================================
           BACKGROUND
        ================================= */

        .sf-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(125, 75, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125, 75, 255, 0.045) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
          pointer-events: none;
        }

        .sf-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(112, 55, 255, 0.10);
          filter: blur(100px);
          left: 20%;
          top: 25%;
          pointer-events: none;
        }

        .sf-glow-two {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(0, 180, 255, 0.08);
          filter: blur(90px);
          right: 10%;
          bottom: 10%;
          pointer-events: none;
        }

        /* ================================
           LEFT SECTION
        ================================= */

        .sf-left {
          width: 62%;
          min-height: 100vh;
          position: relative;
          padding: 42px 55px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .sf-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 5;
        }

        .sf-logo {
          width: 48px;
          height: 55px;
          background: linear-gradient(145deg, #8d4dff, #5522c9);
          clip-path: polygon(30% 0, 100% 0, 68% 38%, 92% 38%, 34% 100%, 45% 53%, 0 53%);
          filter: drop-shadow(0 0 15px rgba(125, 65, 255, 0.65));
        }

        .sf-brand-name {
          font-size: 27px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .sf-brand-name span {
          color: #8b4dff;
        }

        .sf-brand-subtitle {
          font-size: 11px;
          color: #71809f;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .sf-hero {
          position: relative;
          z-index: 3;
          margin-top: 20px;
        }

        .sf-eyebrow {
          color: #a970ff;
          letter-spacing: 6px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .sf-heading {
          font-size: clamp(48px, 5vw, 76px);
          line-height: 0.98;
          margin: 0;
          font-weight: 900;
          letter-spacing: -3px;
          max-width: 650px;
        }

        .sf-heading .purple {
          background: linear-gradient(90deg, #8e4cff, #c27aff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .sf-description {
          color: #9ba7c2;
          font-size: 17px;
          line-height: 1.8;
          margin-top: 25px;
          max-width: 570px;
        }

        /* ================================
           TELEMETRY CARDS
        ================================= */

        .sf-metrics {
          display: flex;
          gap: 14px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .sf-metric {
          min-width: 145px;
          padding: 14px 17px;
          border: 1px solid rgba(139, 77, 255, 0.25);
          background: rgba(10, 15, 35, 0.72);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(100, 50, 255, 0.07);
        }

        .sf-metric-label {
          color: #697796;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .sf-metric-value {
          margin-top: 5px;
          font-size: 20px;
          font-weight: 700;
        }

        .sf-green {
          color: #00e7a5;
        }

        .sf-blue {
          color: #54bfff;
        }

        .sf-purple {
          color: #a66cff;
        }

        /* ================================
           TRUCK AREA
        ================================= */

        .sf-truck-area {
          height: 310px;
          position: relative;
          margin-top: 10px;
        }

        .sf-road {
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: 38px;
          height: 95px;
          background:
            linear-gradient(
              175deg,
              transparent 20%,
              rgba(86, 50, 160, 0.18) 21%,
              rgba(86, 50, 160, 0.18) 80%,
              transparent 81%
            );
          transform: perspective(300px) rotateX(45deg);
        }

        .sf-road-line {
          position: absolute;
          left: 5%;
          right: 5%;
          bottom: 77px;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            #8a4dff 0px,
            #8a4dff 70px,
            transparent 70px,
            transparent 130px
          );
          box-shadow: 0 0 12px #8a4dff;
          opacity: 0.65;
        }

        /* TRUCK */

        .sf-truck {
          position: absolute;
          width: 500px;
          height: 190px;
          left: 50%;
          bottom: 55px;
          transform: translateX(-50%);
          animation: truckFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 20px 25px rgba(0,0,0,0.6));
        }

        @keyframes truckFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-7px);
          }
        }

        .sf-trailer {
          position: absolute;
          width: 310px;
          height: 125px;
          left: 5px;
          top: 20px;
          border-radius: 8px 3px 3px 8px;
          background:
            linear-gradient(145deg, #202344, #0b1022);
          border: 2px solid rgba(141, 77, 255, 0.65);
          box-shadow:
            inset 0 0 30px rgba(120, 60, 255, 0.10),
            0 0 20px rgba(105, 50, 255, 0.20);
        }

        .sf-trailer::before {
          content: "";
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(157, 105, 255, 0.22);
          border-radius: 4px;
        }

        .sf-trailer-logo {
          position: absolute;
          left: 35px;
          top: 48px;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #eee;
        }

        .sf-trailer-logo span {
          color: #9b5cff;
        }

        .sf-trailer-light {
          position: absolute;
          width: 6px;
          height: 105px;
          right: 7px;
          top: 8px;
          background: #8b4dff;
          box-shadow: 0 0 15px #8b4dff;
          border-radius: 5px;
        }

        .sf-cabin {
          position: absolute;
          width: 180px;
          height: 135px;
          right: 10px;
          top: 10px;
          background: linear-gradient(145deg, #24274b, #090d1c);
          clip-path: polygon(
            22% 0,
            82% 0,
            100% 35%,
            100% 100%,
            0 100%,
            0 25%
          );
          border: 2px solid #8650ff;
          box-shadow: 0 0 30px rgba(123, 64, 255, 0.35);
        }

        .sf-window {
          position: absolute;
          width: 110px;
          height: 48px;
          right: 25px;
          top: 18px;
          background: linear-gradient(145deg, #152849, #050b18);
          border: 2px solid rgba(90, 181, 255, 0.65);
          clip-path: polygon(15% 0, 100% 0, 85% 100%, 0 100%);
          box-shadow: inset 0 0 20px rgba(30, 160, 255, 0.15);
        }

        .sf-grille {
          position: absolute;
          width: 80px;
          height: 35px;
          right: 25px;
          bottom: 16px;
          border-radius: 5px;
          background: repeating-linear-gradient(
            0deg,
            #070a14 0px,
            #070a14 4px,
            #39405c 5px,
            #39405c 7px
          );
          border: 1px solid #60698a;
        }

        .sf-headlight {
          position: absolute;
          width: 22px;
          height: 10px;
          bottom: 17px;
          border-radius: 8px;
          background: #a9e9ff;
          box-shadow: 0 0 20px #4bc9ff;
        }

        .sf-headlight.one {
          right: 110px;
        }

        .sf-headlight.two {
          right: 20px;
        }

        .sf-wheel {
          position: absolute;
          width: 55px;
          height: 55px;
          bottom: -12px;
          border-radius: 50%;
          background: #05060b;
          border: 7px solid #1d2235;
          box-shadow: inset 0 0 0 5px #080a12, 0 0 15px rgba(140, 75, 255, 0.2);
        }

        .sf-wheel::after {
          content: "";
          position: absolute;
          width: 15px;
          height: 15px;
          left: 13px;
          top: 13px;
          border-radius: 50%;
          background: #8d52ff;
          box-shadow: 0 0 10px #8d52ff;
        }

        .sf-wheel.w1 {
          left: 48px;
        }

        .sf-wheel.w2 {
          left: 225px;
        }

        .sf-wheel.w3 {
          right: 40px;
        }

        /* ================================
           BOTTOM LABEL
        ================================= */

        .sf-bottom {
          display: flex;
          gap: 22px;
          color: #53607c;
          font-size: 10px;
          letter-spacing: 4px;
          z-index: 4;
        }

        /* ================================
           RIGHT LOGIN SECTION
        ================================= */

        .sf-right {
          width: 38%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          border-left: 1px solid rgba(125, 90, 210, 0.18);
          background: rgba(3, 7, 20, 0.55);
          backdrop-filter: blur(15px);
          z-index: 5;
        }

        .sf-login-card {
          width: min(440px, 100%);
          padding: 42px;
          border-radius: 24px;
          border: 1px solid rgba(145, 90, 255, 0.35);
          background:
            linear-gradient(
              145deg,
              rgba(18, 22, 48, 0.88),
              rgba(7, 10, 25, 0.95)
            );
          box-shadow:
            0 25px 70px rgba(0,0,0,0.45),
            0 0 50px rgba(107, 54, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        .sf-login-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #9b5cff,
            transparent
          );
          box-shadow: 0 0 20px #9b5cff;
        }

        .sf-login-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #7684a2;
          letter-spacing: 1px;
          margin-bottom: 32px;
        }

        .sf-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00e7a5;
          box-shadow: 0 0 12px #00e7a5;
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.7);
          }
        }

        .sf-welcome {
          color: #8b98b5;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .sf-login-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
        }

        .sf-login-title span {
          color: #9255ff;
        }

        .sf-login-subtitle {
          color: #687590;
          font-size: 14px;
          margin: 10px 0 32px;
        }

        .sf-field {
          margin-bottom: 17px;
        }

        .sf-field-label {
          display: block;
          color: #7f8ca8;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .sf-input-wrapper {
          display: flex;
          align-items: center;
          height: 55px;
          border: 1px solid #252d49;
          border-radius: 11px;
          background: rgba(8, 12, 29, 0.85);
          transition: 0.25s;
        }

        .sf-input-wrapper:focus-within {
          border-color: #8c50ff;
          box-shadow: 0 0 0 3px rgba(140, 80, 255, 0.09);
        }

        .sf-input-icon {
          width: 50px;
          text-align: center;
          color: #8c50ff;
          font-size: 18px;
        }

        .sf-input {
          flex: 1;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 14px;
        }

        .sf-input::placeholder {
          color: #4f5b76;
        }

        .sf-eye {
          width: 48px;
          height: 100%;
          border: none;
          background: transparent;
          color: #687590;
          cursor: pointer;
          font-size: 17px;
        }

        .sf-eye:hover {
          color: #a36cff;
        }

        .sf-error {
          color: #ff6d91;
          background: rgba(255, 60, 110, 0.07);
          border: 1px solid rgba(255, 60, 110, 0.18);
          border-radius: 8px;
          padding: 10px;
          font-size: 12px;
          margin-bottom: 15px;
        }

        .sf-signin {
          width: 100%;
          height: 55px;
          border: none;
          border-radius: 11px;
          margin-top: 7px;
          background: linear-gradient(100deg, #7040e8, #a04cff);
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(117, 54, 255, 0.25);
          transition: 0.25s;
        }

        .sf-signin:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 35px rgba(117, 54, 255, 0.38);
        }

        .sf-signin:active {
          transform: translateY(0);
        }

        .sf-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 18px 0 28px;
          font-size: 12px;
        }

        .sf-remember {
          display: flex;
          gap: 8px;
          align-items: center;
          color: #78849e;
        }

        .sf-remember input {
          accent-color: #8b4dff;
        }

        .sf-forgot {
          color: #9d67ff;
          cursor: pointer;
        }

        .sf-or {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #4d5871;
          font-size: 11px;
          margin-bottom: 20px;
        }

        .sf-or span {
          flex: 1;
          height: 1px;
          background: #252b40;
        }

        .sf-google {
          width: 100%;
          height: 52px;
          border: 1px solid #30374e;
          border-radius: 11px;
          background: #f7f7f9;
          color: #111522;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: 0.2s;
        }

        .sf-google:hover {
          background: white;
          transform: translateY(-1px);
        }

        .sf-google-g {
          font-size: 21px;
          font-weight: 800;
          background: conic-gradient(
            from -45deg,
            #4285f4 0deg 90deg,
            #34a853 90deg 180deg,
            #fbbc05 180deg 270deg,
            #ea4335 270deg 360deg
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .sf-footer {
          text-align: center;
          margin-top: 28px;
          color: #4e5a74;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .sf-footer span {
          color: #78849e;
        }

        /* ================================
           RESPONSIVE
        ================================= */

        @media (max-width: 1000px) {
          .sf-login {
            overflow-y: auto;
          }

          .sf-left {
            width: 55%;
            padding: 30px;
          }

          .sf-right {
            width: 45%;
            padding: 25px;
          }

          .sf-heading {
            font-size: 48px;
          }

          .sf-truck {
            transform: translateX(-50%) scale(0.78);
          }
        }

        @media (max-width: 760px) {
          .sf-login {
            flex-direction: column;
          }

          .sf-left {
            width: 100%;
            min-height: auto;
            padding: 30px 22px;
          }

          .sf-right {
            width: 100%;
            min-height: auto;
            border-left: none;
            padding: 25px 20px 40px;
          }

          .sf-hero {
            margin-top: 60px;
          }

          .sf-heading {
            font-size: 43px;
          }

          .sf-description {
            font-size: 14px;
          }

          .sf-truck-area {
            height: 250px;
          }

          .sf-truck {
            transform: translateX(-50%) scale(0.62);
            transform-origin: bottom center;
          }

          .sf-login-card {
            padding: 30px 24px;
          }

          .sf-bottom {
            display: none;
          }
        }
      `}</style>

      <div className="sf-login">

        {/* Background */}
        <div className="sf-grid"></div>
        <div className="sf-glow"></div>
        <div className="sf-glow-two"></div>


        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <section className="sf-left">

          {/* Brand */}
          <div className="sf-brand">

            <div className="sf-logo"></div>

            <div>
              <div className="sf-brand-name">
                STREAM<span>FORGE</span>
              </div>

              <div className="sf-brand-subtitle">
                REAL-TIME STREAMING PLATFORM
              </div>
            </div>

          </div>


          {/* Hero */}
          <div className="sf-hero">

            <div className="sf-eyebrow">
              REAL-TIME TELEMETRY
            </div>

            <h1 className="sf-heading">
              Powering
              <br />
              Smarter <span className="purple">Fleets.</span>
            </h1>

            <p className="sf-description">
              Monitor your fleet in real time.
              <br />
              Detect anomalies. Make smarter decisions.
            </p>


            {/* Live metrics */}
            <div className="sf-metrics">

              <div className="sf-metric">
                <div className="sf-metric-label">
                  System
                </div>

                <div className="sf-metric-value sf-green">
                  ● ONLINE
                </div>
              </div>

              <div className="sf-metric">
                <div className="sf-metric-label">
                  Active Trucks
                </div>

                <div className="sf-metric-value sf-blue">
                  03
                </div>
              </div>

              <div className="sf-metric">
                <div className="sf-metric-label">
                  Kafka Stream
                </div>

                <div className="sf-metric-value sf-purple">
                  LIVE
                </div>
              </div>

            </div>


            {/* Truck */}
            <div className="sf-truck-area">

              <div className="sf-road"></div>

              <div className="sf-road-line"></div>


              <div className="sf-truck">

                {/* Trailer */}
                <div className="sf-trailer">

                  <div className="sf-trailer-logo">
                    ⚡ STREAM<span>FORGE</span>
                  </div>

                  <div className="sf-trailer-light"></div>

                </div>


                {/* Cabin */}
                <div className="sf-cabin">

                  <div className="sf-window"></div>

                  <div className="sf-grille"></div>

                  <div className="sf-headlight one"></div>

                  <div className="sf-headlight two"></div>

                </div>


                {/* Wheels */}
                <div className="sf-wheel w1"></div>
                <div className="sf-wheel w2"></div>
                <div className="sf-wheel w3"></div>

              </div>

            </div>

          </div>


          {/* Bottom */}
          <div className="sf-bottom">
            <span>STREAM</span>
            <span>|</span>
            <span>PROCESS</span>
            <span>|</span>
            <span>ANALYZE</span>
            <span>|</span>
            <span>PROTECT</span>
          </div>

        </section>


        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <section className="sf-right">

          <div className="sf-login-card">

            {/* Status */}
            <div className="sf-login-status">
              <span className="sf-status-dot"></span>
              STREAMFORGE SYSTEM ONLINE
            </div>


            {/* Heading */}
            <div className="sf-welcome">
              Welcome back
            </div>

            <h2 className="sf-login-title">
              STREAM<span>FORGE</span>
            </h2>

            <p className="sf-login-subtitle">
              Sign in to access your real-time fleet dashboard
            </p>


            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Username */}
              <div className="sf-field">

                <label className="sf-field-label">
                  Username
                </label>

                <div className="sf-input-wrapper">

                  <span className="sf-input-icon">
                    ◉
                  </span>

                  <input
                    className="sf-input"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                  />

                </div>

              </div>


              {/* Password */}
              <div className="sf-field">

                <label className="sf-field-label">
                  Password
                </label>

                <div className="sf-input-wrapper">

                  <span className="sf-input-icon">
                    ◈
                  </span>

                  <input
                    className="sf-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />

                  <button
                    type="button"
                    className="sf-eye"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "◉" : "◎"}
                  </button>

                </div>

              </div>


              {/* Error */}
              {error && (
                <div className="sf-error">
                  ⚠ {error}
                </div>
              )}


              {/* Sign in */}
              <button
                type="submit"
                className="sf-signin"
              >
                SIGN IN&nbsp;&nbsp; →
              </button>

            </form>


            {/* Options */}
            <div className="sf-options">

              <label className="sf-remember">

                <input
                  type="checkbox"
                  defaultChecked
                />

                Remember me

              </label>

              <span className="sf-forgot">
                Forgot password?
              </span>

            </div>


            {/* OR */}
            <div className="sf-or">

              <span></span>

              OR

              <span></span>

            </div>


            {/* Google */}
            <button
              type="button"
              className="sf-google"
            >

              <span className="sf-google-g">
                G
              </span>

              Continue with Google

            </button>


            {/* Footer */}
            <div className="sf-footer">
              <span>REAL-TIME</span>
              &nbsp;&nbsp;•&nbsp;&nbsp;
              <span>RELIABLE</span>
              &nbsp;&nbsp;•&nbsp;&nbsp;
              <span>SCALABLE</span>
            </div>

          </div>

        </section>

      </div>
    </>
  );
}

export default Login;