import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from '../pages/AuthForm';
import HomePage from '../pages/HomePage';
import TrashPage from '../pages/TrashPage';
import UserPage from '../pages/UserPage';
import EditEventPage from '../pages/EditEventPage';
import CreateEventPage from '../pages/CreateEventPage';
import SearchPage from '../pages/SearchPage';
import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { notify } = useNotification();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        // Show loading state while checking authentication
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page with notification
        notify('Vui lòng đăng nhập trước', 'error');
        return <Navigate to="/" />;
    }

    return children;
};

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Public routes - accessible without authentication */}
                <Route path="/" element={<AuthForm />} />
                
                {/* Protected routes - need authentication */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
                <Route path="/trash" element={
                    <ProtectedRoute>
                        <TrashPage />
                    </ProtectedRoute>
                } />
                <Route path="/user" element={
                    <ProtectedRoute>
                        <UserPage />
                    </ProtectedRoute>
                } />
                <Route path="/create-event" element={
                    <ProtectedRoute>
                        <CreateEventPage />
                    </ProtectedRoute>
                } />
                <Route path="/edit-event/:id" element={
                    <ProtectedRoute>
                        <EditEventPage />
                    </ProtectedRoute>
                } />
                <Route path="/search" element={
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    )
}