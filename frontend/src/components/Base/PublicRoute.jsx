import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, getRole } from "../../utils/token";

const ROLE_HOME = {
  Admin: "/dashboard",
  Teacher: "/attendance",
  Student: "/",
};

const PublicRoute = () => {
  const token = getAccessToken();
  const role = getRole();

  if (token) {
    const redirectTo = ROLE_HOME[role] ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;