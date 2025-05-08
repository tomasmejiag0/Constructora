import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { Dashboard } from "@/pages/dashboard";
import { TasksPage } from "@/pages/tasks";
import { InventoryPage } from "@/pages/inventory";
import { BudgetPage } from "@/pages/budget";
import { UsersPage } from "@/pages/users";
import { WorkerDashboard } from "@/pages/worker-dashboard";
import { ProjectsPage } from "@/pages/projects";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/pages/loading-screen";

const ROUTE_PERMISSIONS = {
  "1": ["/", "/tasks", "/inventory", "/budget", "/users", "/projects"], //admin
  "3": ["/", "/tasks", "/inventory", "/budget", "/projects"], //gerente
  "2": ["/", "/tasks", "/projects"], // jefe de obra
  "4": ["/"] // trabajador
};

function AppContent() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Clear localStorage except for essential auth data
    const authData = localStorage.getItem('sb-lmfqpfajddfzrtqnbnyj-auth-token');
    localStorage.clear();
    if (authData) {
      localStorage.setItem('sb-lmfqpfajddfzrtqnbnyj-auth-token', authData);
    }
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return location.pathname !== "/login" ? <Navigate to="/login" /> : <LoginPage />;
  }

  if (profile?.role.toLowerCase() === "trabajador") {
    return <WorkerDashboard />;
  }

  const userRole = profile?.role.toLowerCase();
  const allowedRoutes = ROUTE_PERMISSIONS[userRole] || [];

  if (!allowedRoutes.includes(location.pathname)) {
    return <Navigate to={allowedRoutes[0] || "/"} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/budget" element={<BudgetPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/users" element={profile?.role.toLowerCase() === "admin" ? <UsersPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}