import React, { useState, useEffect } from 'react';
import { FiHome, FiUploadCloud, FiActivity, FiUser, FiLogOut } from 'react-icons/fi';
import Dashboard from './Dashboard';
import UploadView from './UploadView';
import AuthView from './AuthView';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // State to track the live metrics output from the Python AI pipeline
  const [hasData, setHasData] = useState(false); 
  const [metrics, setMetrics] = useState(null);
  
  // State to track full historic data arrays
  const [historyData, setHistoryData] = useState([]);

  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/history/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.history || []);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };
  
  if (!isAuthenticated) {
    return <AuthView onLogin={(userData) => {
       setIsAuthenticated(true);
       setUser(userData);
       
       // Crucial feature: Retain user history upon logging back in!
       if (userData.has_history && userData.metrics) {
           setHasData(true);
           setMetrics(userData.metrics);
       } else {
           setHasData(false);
           setMetrics(null);
       }
       
       // Trigger sync of complete timeline arrays
       fetchHistory(userData.user_id);
    }} />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand-title">
          <FiActivity className="text-teal" />
          <span className="text-gradient">ClassPulse</span>
        </div>
        
        <nav className="flex-col" style={{ flex: 1 }}>
          <div className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <FiHome /> Dashboard
          </div>
          <div className={`nav-item ${currentView === 'upload' ? 'active' : ''}`} onClick={() => setCurrentView('upload')}>
            <FiUploadCloud /> Upload Lecture
          </div>
        </nav>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <div className="nav-item">
            <FiUser /> {user ? user.name : 'Professor'}
          </div>
          <div className="nav-item" onClick={() => setIsAuthenticated(false)} style={{ color: 'var(--warning)', cursor: 'pointer' }}>
            <FiLogOut /> Sign Out
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        {currentView === 'dashboard' ? (
           <Dashboard 
             hasData={hasData} 
             metrics={metrics}
             historyData={historyData}
             onSelectHistoricRow={(historicMetrics) => {
               setHasData(true);
               setMetrics(historicMetrics);
             }}
             onNavigateUpload={() => setCurrentView('upload')} 
           />
        ) : (
           <UploadView 
             userId={user.user_id}
             onUploadComplete={(analyzedMetrics) => {
                 setHasData(true);
                 setMetrics(analyzedMetrics);
                 // Re-sync historical backend deck!
                 fetchHistory(user.user_id);
             }} 
             onNavigateDashboard={() => setCurrentView('dashboard')} 
           />
        )}
      </main>
    </div>
  );
}

export default App;
