import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/" />; // redirect to login
  }

  return children;
}

export default ProtectedRoute;