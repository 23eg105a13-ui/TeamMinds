import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Comparison from './pages/Comparison';
import GitHubAnalyzer from './pages/GitHubAnalyzer';
import HistoryPage from './pages/History';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)]">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/comparison" element={
                            <ProtectedRoute>
                                <Comparison />
                            </ProtectedRoute>
                        } />
                        <Route path="/github" element={
                            <ProtectedRoute>
                                <GitHubAnalyzer />
                            </ProtectedRoute>
                        } />
                        <Route path="/history" element={
                            <ProtectedRoute>
                                <HistoryPage />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
