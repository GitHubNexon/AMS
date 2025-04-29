import React from "react";
import { useAuth } from "../context/AuthContext";
import Home from "../Pages/Home";
import NotFound from "./NotFound";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const { user } = useAuth();

  return user ? (
    element
  ) : (
    <Router basename="/AMS/">
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        {/* suppress no route warning on subpages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default PrivateRoute;
