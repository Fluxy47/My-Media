import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Utils/ProtectedRoute";
import { AuthProvider } from "./Utils/AuthContext";
import Login from "./Components/Login";
import Home from "./Containers/Home";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
