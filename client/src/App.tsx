import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleProtectedRoute } from "./routes/RoleProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

import ResidentDashboard from "./pages/resident/Dashboard";
import RaiseComplaint from "./pages/resident/RaiseComplaint";
import MyComplaints from "./pages/resident/MyComplaints";
import ResidentComplaintDetails from "./pages/resident/ComplaintDetails";
import ResidentNotices from "./pages/resident/Notices";

import AdminDashboard from "./pages/admin/Dashboard";
import ComplaintManagement from "./pages/admin/ComplaintManagement";
import AdminComplaintDetails from "./pages/admin/ComplaintDetails";
import NoticeManagement from "./pages/admin/NoticeManagement";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/resident/dashboard"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute allow={["RESIDENT"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/resident/dashboard" element={<ResidentDashboard />} />
            <Route path="/resident/complaints/new" element={<RaiseComplaint />} />
            <Route path="/resident/complaints" element={<MyComplaints />} />
            <Route path="/resident/complaints/:id" element={<ResidentComplaintDetails />} />
            <Route path="/resident/notices" element={<ResidentNotices />} />
            <Route path="/resident/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<RoleProtectedRoute allow={["ADMIN"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<ComplaintManagement />} />
            <Route path="/admin/complaints/:id" element={<AdminComplaintDetails />} />
            <Route path="/admin/notices" element={<NoticeManagement />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
