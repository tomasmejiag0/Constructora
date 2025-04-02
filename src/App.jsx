import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/login";
import RegisterPage from "./pages/register";
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import InventoryPage from "@/pages/inventory";
import BudgetPage from "@/pages/budget";
import UsersPage from "@/pages/users";
import WorkerDashboard from "@/pages/worker-dashboard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return element;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/tasks" element={<ProtectedRoute element={<TasksPage />} />} />
        <Route path="/inventory" element={<ProtectedRoute element={<InventoryPage />} />} />
        <Route path="/budget" element={<ProtectedRoute element={<BudgetPage />} />} />
        <Route path="/users" element={<ProtectedRoute element={<UsersPage />} />} />
        <Route path="/worker-dashboard" element={<ProtectedRoute element={<WorkerDashboard />} />} />
      </Routes>
    </AuthProvider>
  );
}
