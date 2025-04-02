import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { LoginPage } from "@/pages/login";
import RegisterPage from "@/pages/register";
import { Dashboard } from "@/pages/dashboard";
import { TasksPage } from "@/pages/tasks";
import { InventoryPage } from "@/pages/inventory";
import { BudgetPage } from "@/pages/budget";
import { UsersPage } from "@/pages/users";
import { WorkerDashboard } from "@/pages/worker-dashboard";

export default function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return window.location.pathname === "/register" ? <RegisterPage /> : <LoginPage />;
  }

  if (user.role === "trabajador") {
    return <WorkerDashboard />;
  }

  const renderPage = () => {
    switch (window.location.pathname) {
      case "/tasks":
        return <TasksPage />;
      case "/inventory":
        return <InventoryPage />;
      case "/budget":
        return <BudgetPage />;
      case "/users":
        return <UsersPage />;
      default:
        return <Dashboard />;
    }
  };

  return <div className="min-h-screen bg-background">{renderPage()}</div>;
}
