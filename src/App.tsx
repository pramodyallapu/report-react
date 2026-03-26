import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CustomReportPage from './pages/CustomReportPage';
import ReportPage from './pages/ReportPage';
import ScheduledReports from './pages/ScheduledReports';
import SharedReportPage from './pages/SharedReportPage';
import { RefreshCw } from 'lucide-react';
import * as api from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.staffReportsAPI.getActiveStaff();
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.authAPI.logout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed', err);
      // Still set to false to let user attempt login again
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    const isLoaderEnabled = localStorage.getItem('loaderEnabled') !== 'false';
    if (!isLoaderEnabled) return null;

    return (
      <div className="premium-loader-container">
        <div className="loader-logo-wrapper">
          <div className="loader-ring" />
          <div className="loader-ring" />
          <RefreshCw size={40} className="loader-icon" />
        </div>
        <div className="loader-content">
          <div className="loader-text">Authenticating</div>
          <div className="loader-subtext">Preparing your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/shared/:reportId" element={<SharedReportPage />} />
        <Route path="*" element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
      </Routes>
    );
  }

  // Authenticated Application
  return (
    <Routes>
      <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
      <Route path="/custom-report" element={<CustomReportPage />} />
      <Route path="/report/:reportId" element={<ReportPage />} />
      <Route path="/shared/:reportId" element={<SharedReportPage />} />
      <Route path="/scheduled" element={<ScheduledReports />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
