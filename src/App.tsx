import type { FC } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Donate from './pages/Donate';
import BrowseDonations from './pages/BrowseDonations';
import RiderDashboard from './pages/RiderDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

const App: FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="donate" element={<Donate />} />
              <Route path="browse" element={<BrowseDonations />} />
              <Route path="rider-dashboard" element={<RiderDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;