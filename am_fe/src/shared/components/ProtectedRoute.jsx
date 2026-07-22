import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Wraps routes that require authentication and/or specific roles.
 *
 * Usage patterns:
 *   1. Layout route (wraps nested routes via <Outlet>):
 *      <Route element={<ProtectedRoute />}>
 *        <Route path="/dashboard" element={<Dashboard />} />
 *      </Route>
 *
 *   2. Explicit children:
 *      <ProtectedRoute allowedRoles={['ADMIN']}>
 *        <AdminPage />
 *      </ProtectedRoute>
 *
 * If not authenticated → redirect to /login (preserving the intended URL in state)
 * If wrong role → redirect to /unauthorized
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If children provided, render them; otherwise act as a layout route with Outlet
  return children ?? <Outlet />;
}

export default ProtectedRoute;
