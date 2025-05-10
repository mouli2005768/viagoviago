import React, { useState } from "react";
import "./App.css";
import { BASEURL, callApi, setSession } from "./api";
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate();
  const [popupType, setPopupType] = useState(null); // 'login', 'register', or null
  const [formData, setFormData] = useState({
    fullname: "",
    emailid: "",
    gender: "",
    phonenumber: "",
    password: "",
    confirmpassword: ""
  });
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [ackMessage, setAckMessage] = useState(""); // For error/success messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signUp = () => {
    if (formData.password !== formData.confirmpassword) {
      alert("Passwords do not match!");
      return;
    }

    let data = JSON.stringify({
      fullname: formData.fullname,
      emailid: formData.emailid,
      gender: formData.gender,
      phonenumber: formData.phonenumber,
      password: formData.password
    });

    callApi("POST", `${BASEURL}user/signup`, data, signupResponse);
  };

  const signupResponse = (response) => {
    alert(response);
    localStorage.setItem('isAuthenticated', 'true');
    navigate("/home");
  };

  const forgotPassword = () => {
    if (!formData.emailid) {
      alert("Please enter your email ID");
      return;
    }

    let data = JSON.stringify({ emailid: formData.emailid });
    callApi("POST", `${BASEURL}user/forgotpassword`, data, forgotPasswordResponse);
  };

  const forgotPasswordResponse = (response) => {
    let data = response.split("::");
    setForgotPasswordMessage(data[1]);
    if (data[0] === "200") {
      setForgotPasswordMessage((prev) => `✅ ${prev}`);
    } else {
      setForgotPasswordMessage((prev) => `❌ ${prev}`);
    }
  };

  const signIn = () => {
    if (!formData.emailid || !formData.password) {
      setAckMessage("Please enter both email and password.");
      return;
    }

    let data = JSON.stringify({
      emailid: formData.emailid,
      password: formData.password
    });

    callApi("POST", `${BASEURL}user/signin`, data, (response) => signInResponse(response, navigate));
  };

  const signInResponse = (response, navigate) => {
    if (typeof response === "string") {
      let data = response.split("::");
      if (data[0] === "200") {
        alert(data[1]);
        setSession("userToken", data[2], 7);
        localStorage.setItem('isAuthenticated', 'true');
        setPopupType(null);
        setAckMessage("");
        navigate("/home");
      } else {
        setAckMessage(`❌ ${data[1]}`);
      }
    } else if (typeof response === "object") {
      if (response.status === 200) {
        alert(response.message || "Login successful");
        setSession("userToken", response.token, 7);
        localStorage.setItem('isAuthenticated', 'true');
        setPopupType(null);
        setAckMessage("");
        navigate("/home");
      } else {
        setAckMessage(`❌ ${response.message || "Login failed"}`);
      }
    } else {
      setAckMessage("Unexpected response format.");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo-text">ViaGo</h1>
        <div className="header-login-register">
          <h3 className="login" onClick={() => setPopupType("login")}>Login</h3>
          <h3 className="register" onClick={() => setPopupType("register")}>Register</h3>
        </div>
      </header>

      <main className="content">
        {!popupType ? (
          <>
            <img src="logo.jpg" alt="ViaGo Logo" className="logo large-logo" />
            <h1 className="main-heading">Welcome to ViaGo!</h1>
            <h1 className="main-heading">Connecting travelers, sharing journeys</h1>
          </>
        ) : (
          <div className={`popup-content ${popupType ? "popup-show" : ""}`}>
            <span className="close" onClick={() => setPopupType(null)}>&times;</span>
            {popupType === "login" ? (
              <>
                <h2>Login</h2>
                <input
                  type="email"
                  placeholder="Email ID"
                  name="emailid"
                  onChange={handleChange}
                />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                />
                <div className="popup-actions">
                  <button className="popup-btn" onClick={signIn}>Login</button>
                  <span className="forgot-password" onClick={forgotPassword}>
                    Forgot Password?
                  </span>
                </div>
                {ackMessage && <p className="password-message">{ackMessage}</p>}
                <div className="popup-actions">
                  <span className="switch-popup" onClick={() => setPopupType("register")}>
                    Not registered? Sign up
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2>Register</h2>
                <input
                  type="text"
                  placeholder="Full Name"
                  name="fullname"
                  onChange={handleChange}
                />
                <input
                  type="email"
                  placeholder="Email ID"
                  name="emailid"
                  onChange={handleChange}
                />
                <div className="gender">
                  <label><input type="radio" name="gender" value="male" onChange={handleChange} /> Male</label>
                  <label><input type="radio" name="gender" value="female" onChange={handleChange} /> Female</label>
                  <label><input type="radio" name="gender" value="other" onChange={handleChange} /> Other</label>
                </div>
                <input
                  type="text"
                  placeholder="Phone Number"
                  name="phonenumber"
                  onChange={handleChange}
                />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmpassword"
                  onChange={handleChange}
                />
                <button className="popup-btn" onClick={signUp}>Register</button>
                <div className="popup-actions">
                  <span className="switch-popup" onClick={() => setPopupType("login")}>
                    Already have an account? Login
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-left">
          <img src="insta.jpg" alt="Instagram" className="social-icon" />
          <img src="telegram.jpg" alt="Telegram" className="social-icon" />
          <img src="linkedin.jpg" alt="LinkedIn" className="social-icon" />
        </div>
        <div className="footer-right">
          <p>Disclaimer | Rights</p>
        </div>
        <div className="footer-bottom">
          <h4>About</h4>
          <h4>Info</h4>
          <h4>ViaGo Format</h4>
        </div>
      </footer>
    </div>
  );
};

export default App;
