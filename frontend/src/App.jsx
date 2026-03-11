// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Scouts from './pages/Scouts'; 
import Archive from './pages/Archive';
import AdminManagement from './pages/AdminManagement';
import History from './pages/History';
import Logs from './pages/Logs';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Super Admin Only Route Component
const SuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'super_admin') {
    return <Navigate to="/workspace" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/workspace" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <RoleSelection />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login/:role" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register/:role" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/workspace" 
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          } 
        />
        
        {/* Super Admin Only Routes */}
        <Route 
          path="/admin" 
          element={
            <SuperAdminRoute>
              <AdminManagement />
            </SuperAdminRoute>
          } 
        />

        <Route 
          path="/history" 
          element={
            <SuperAdminRoute>
              <History />
            </SuperAdminRoute>
          } 
        />

        <Route 
          path="/logs" 
          element={
            <SuperAdminRoute>
              <Logs />
            </SuperAdminRoute>
          } 
        />
        
        <Route 
          path="/scouts" 
          element={
            <ProtectedRoute>
              <Scouts />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/archive" 
          element={
            <ProtectedRoute>
              <Archive />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;