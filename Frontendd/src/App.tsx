import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageParkings from "./pages/admin/ManageParkings";
import AdminReports from "./pages/admin/AdminReports";
import LogsPage from "./pages/admin/LogsPage";
import AttendantDashboard from "./pages/attendant/AttendantDashboard";
import CarEntry from "./pages/attendant/CarEntry";
import CarExit from "./pages/attendant/CarExit";
import SpaceManagement from "./pages/attendant/SpaceManagement";

const queryClient = new QueryClient();

// Dashboard router component to redirect based on role
const DashboardRouter = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'PARKING_ATTENDANT':
      return <Navigate to="/attendant/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Redirect from root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Role-based redirect */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-parkings" 
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                  <ManageParkings />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminReports />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/logs" 
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                  <LogsPage />
                </RoleProtectedRoute>
              } 
            />
            
            {/* Parking Attendant Routes */}
            <Route 
              path="/attendant/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={["PARKING_ATTENDANT"]}>
                  <AttendantDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/attendant/car-entry" 
              element={
                <RoleProtectedRoute allowedRoles={["PARKING_ATTENDANT"]}>
                  <CarEntry />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/attendant/car-exit" 
              element={
                <RoleProtectedRoute allowedRoles={["PARKING_ATTENDANT"]}>
                  <CarExit />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/attendant/space-management" 
              element={
                <RoleProtectedRoute allowedRoles={["PARKING_ATTENDANT"]}>
                  <SpaceManagement />
                </RoleProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
