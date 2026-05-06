import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, getRole } from "../../utils/token";

const ProtectedRoute = ({allowedRoles}) => {
    const token = getAccessToken();
    const userRole = getRole();

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />
    }
    return <Outlet />
}
export default ProtectedRoute;