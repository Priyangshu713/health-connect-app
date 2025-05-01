import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, useRef } from 'react';
import { Analytics } from "@vercel/analytics/react"; // Import Analytics
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Profile from './pages/Profile';
import HealthReport from './pages/HealthReport';
import Nutrition from './pages/Nutrition';
import AIBot from './pages/AIBot';
import About from './pages/About';
import NotFound from './pages/NotFound';
import History from './pages/History';
import DoctorFinder from './pages/DoctorFinder';
import DoctorDetails from './pages/DoctorDetails';
import DoctorPortal from './pages/DoctorPortal';
import LoadingScreen from './components/LoadingScreen';
import TermsAndPrivacyPage from './pages/TermsAndPrivacyPage';
import Contact from './pages/Contact';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import './App.css';
import { synchronizeTier } from '@/api/auth';

export const dispatchAuthEvent = (isAuthenticated: boolean, email?: string) => {
  const event = new CustomEvent('authStateChanged', {
    detail: { isAuthenticated, email }
  });
  window.dispatchEvent(event);
};

function App() {
  const [loading, setLoading] = useState(true);
  const modalRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);

    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('token');

    // If authenticated, synchronize tier with backend
    if (isAuth && token) {
      synchronizeTier().catch(error => {
        console.error('Background tier synchronization failed:', error);
      });
    }
  }, []);

  return (
    <>
      {loading ? (
        <LoadingScreen onFinished={() => setLoading(false)} />
      ) : (
        <Router>
          <Navbar />
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/health-report" element={<HealthReport />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/ai-bot" element={<AIBot />} />
                <Route path="/about" element={<About />} />
                <Route path="/history" element={<History />} />
                <Route path="/doctor-finder" element={<DoctorFinder />} />
                <Route path="/doctor/:id" element={<DoctorDetails />} />
                <Route path="/doctor-portal" element={<DoctorPortal />} />
                <Route path="/terms-privacy" element={<TermsAndPrivacyPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <div id="modal-root" ref={modalRootRef}></div>
          </div>
          <Analytics /> {/* Add Analytics component here */}
        </Router>
      )}
    </>
  );
}

export default App;
