import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPractice from './pages/CategoryPractice';
import ProblemWorkspace from './pages/ProblemWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<CategoryPractice />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/problem/:idOrSlug" element={<ProblemWorkspace />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
