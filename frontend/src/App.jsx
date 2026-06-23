import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import WeatherBackground from './components/WeatherBackground';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';
import './styles/globals.css';

const AppContent = () => {
  const { getWeatherBgClass } = useTheme();

  return (
    <div className={`min-h-screen relative transition-all duration-1000 ${getWeatherBgClass()}`}>
      <WeatherBackground />
      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)' }}
      />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/ai-assistant" element={<AIAssistant/>}/>
        </Routes>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(18, 17, 30, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '14px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#6366f1', secondary: '#fff' },
                duration: 3000,
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                duration: 4000,
              },
            }}
          />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
