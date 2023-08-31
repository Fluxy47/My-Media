import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="101454148297-q5gn1nqhkh5mfu306spft2fcq5abd1i2.apps.googleusercontent.com">
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
