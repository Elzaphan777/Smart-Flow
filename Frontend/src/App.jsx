import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import CustomerView from './components/CustomerView';
import SecurityView from './components/SecurityView';
import ManagerView from './components/ManagerView';
import { Sun, Moon, Shield, User, Landmark, Bell } from 'lucide-react';

function AppContent() {
  const { theme, toggleTheme, activeRole, setActiveRole, notifications } = useApp();

  const unreadAlerts = notifications.filter(n => !n.read).length;

  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px'
    }}>
      {/* Interactive Role Switcher - Demo Helper */}
      <div className="glass-panel" style={{
        padding: '12px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '480px',
        width: '100%',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
          DEMO SWITCHER:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveRole('customer')}
            className={`glass-button ${activeRole === 'customer' ? 'primary' : ''}`}
            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem' }}
          >
            <User size={12} /> Customer
          </button>
          <button
            onClick={() => setActiveRole('security')}
            className={`glass-button ${activeRole === 'security' ? 'primary' : ''}`}
            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem' }}
          >
            <Shield size={12} /> Security
          </button>
          <button
            onClick={() => setActiveRole('manager')}
            className={`glass-button ${activeRole === 'manager' ? 'primary' : ''}`}
            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem' }}
          >
            <Landmark size={12} /> Manager
          </button>
        </div>
      </div>

      {/* Mobile Device Mockup Frame */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '36px',
        overflow: 'hidden',
        position: 'relative',
        border: '6px solid var(--card-border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Mobile Status Bar Indicator */}
        <div style={{
          height: '24px',
          background: 'rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          fontWeight: '600'
        }}>
          <span>SmartFlow Network</span>
          <div style={{ width: '60px', height: '14px', borderRadius: '7px', background: 'var(--text-secondary)', opacity: 0.15 }}></div>
          <span>12:00 PM</span>
        </div>

        {/* Application Header */}
        <header style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--color-accent)'
            }} className="animate-pulse-soft"></div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Smart Flow
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Show Alerts count only to Security/Manager */}
            {activeRole !== 'customer' && unreadAlerts > 0 && (
              <div style={{ position: 'relative', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                <Bell size={18} />
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--color-danger)',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '14px',
                  height: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadAlerts}
                </span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        {/* App Main Body View Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.01)',
          paddingBottom: '20px'
        }}>
          {activeRole === 'customer' && <CustomerView />}
          {activeRole === 'security' && <SecurityView />}
          {activeRole === 'manager' && <ManagerView />}
        </main>

        {/* Mobile Device Home Bar cutout */}
        <div style={{
          height: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '6px'
        }}>
          <div style={{
            width: '120px',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--text-secondary)',
            opacity: 0.3
          }}></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
