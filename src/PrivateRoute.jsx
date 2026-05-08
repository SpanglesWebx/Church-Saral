// import React from "react";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children, allowedRoles }) => {
//   const token = window.sessionStorage.getItem("token");
// if (!token) return <Navigate to="/" />;

// let userRoles = [];
// try {
//   const payload = JSON.parse(atob(token.split(".")[1]));
//   userRoles = payload.roles || [];
// } catch (err) {
//   return <Navigate to="/" />;
// }

// const isAllowed = allowedRoles.some(role => userRoles.includes(role));
// if (!isAllowed) return <Navigate to="/" />;


//   return children;
// };

// export default PrivateRoute;



import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles = [] }) => {

  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  let userRoles = [];

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRoles = payload.roles || [];
  } catch (err) {
    sessionStorage.clear();
    return <Navigate to="/" replace />;
  }

  // if no role restriction
  if (allowedRoles.length === 0) {
    return children;
  }

  const isAllowed = allowedRoles.some(role => userRoles.includes(role));

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;