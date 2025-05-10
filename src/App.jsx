
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';
    import LoginPage from '@/pages/LoginPage';
    import AdminDashboardPage from '@/pages/AdminDashboardPage';
    import ProjectManagerDashboardPage from '@/pages/ProjectManagerDashboardPage';
    import WorkerDashboardPage from '@/pages/WorkerDashboardPage';
    import NotFoundPage from '@/pages/NotFoundPage';
    import ProtectedRoute from '@/components/ProtectedRoute';
    import MainLayout from '@/layouts/MainLayout';
    import { Toaster } from '@/components/ui/toaster';

    import UserManagementPage from '@/pages/admin/UserManagementPage';
    import AdminProjectManagementPage from '@/pages/admin/AdminProjectManagementPage';
    import ManagerProjectManagementPage from '@/pages/manager/ManagerProjectManagementPage';
    import WorkerManagementPage from '@/pages/manager/WorkerManagementPage';
    import ManagerTaskPage from '@/pages/manager/ManagerTaskPage';
    import WorkerSiteViewPage from '@/pages/worker/WorkerSiteViewPage';
    import AttendancePage from '@/pages/worker/AttendancePage';


    function AppContent() {
      const { user } = useAuth();

      return (
        <Routes>
          <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <LoginPage />} />
          
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<MainLayout><AdminDashboardPage /></MainLayout>} />
            <Route path="/admin/users" element={<MainLayout><UserManagementPage /></MainLayout>} />
            <Route path="/admin/projects" element={<MainLayout><AdminProjectManagementPage /></MainLayout>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['project_manager']} />}>
            <Route path="/project_manager/dashboard" element={<MainLayout><ProjectManagerDashboardPage /></MainLayout>} />
            <Route path="/project_manager/projects" element={<MainLayout><ManagerProjectManagementPage /></MainLayout>} />
            <Route path="/project_manager/workers" element={<MainLayout><WorkerManagementPage /></MainLayout>} />
            <Route path="/project_manager/tasks/:projectId" element={<MainLayout><ManagerTaskPage /></MainLayout>} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
            <Route path="/worker/dashboard" element={<MainLayout><WorkerDashboardPage /></MainLayout>} />
            <Route path="/worker/site" element={<MainLayout><WorkerSiteViewPage /></MainLayout>} />
            <Route path="/worker/attendance" element={<MainLayout><AttendancePage /></MainLayout>} />
          </Route>

          <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      );
    }

    function App() {
      return (
        <Router>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </Router>
      );
    }

    export default App;
  