import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import CustomerView from './components/CustomerView';
import SecurityView from './components/SecurityView';
import ManagerView from './components/ManagerView';
import AuthView from './components/AuthView';
import { Sun, Moon, Bell, LogOut, Landmark, User, Shield } from 'lucide-react';

function AppContent() {
  const { theme, toggleTheme, notifications, user, logoutUser } = useApp();

  const unreadAlerts = notifications ? notifications.filter(n => !n.read).length : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Full-Width Website Header */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRadius: '0 0 20px 20px',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          height: '70px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)'
            }}>
              <Landmark size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                SmartFlow <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--color-secondary)', padding: '1px 6px', background: 'var(--color-secondary-light)', borderRadius: '4px' }}>Bank Portal</span>
              </h1>
            </div>
          </div>

          {/* Nav Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '8px' }}>
                {/* User Info Badge */}
                <div className="glass-panel" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  boxShadow: 'none',
                  fontSize: '0.85rem'
                }}>
                  {user.role === 'manager' && <Shield size={14} style={{ color: 'var(--color-secondary)' }} />}
                  {user.role === 'security' && <Shield size={14} style={{ color: 'var(--color-accent)' }} />}
                  {user.role === 'customer' && <User size={14} style={{ color: 'var(--color-accent)' }} />}
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                  <span className={`badge ${user.role === 'manager' ? 'secondary' : 'primary'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                    {user.role === 'manager' ? 'Admin' : user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Notification Bell (Only for Staff roles) */}
            {user && user.role !== 'customer' && unreadAlerts > 0 && (
              <div style={{ position: 'relative', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Bell size={20} />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--color-danger)',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadAlerts}
                </span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="glass-button"
              style={{
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '10px',
                border: '1px solid var(--card-border)'
              }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Sign Out Action */}
            {user && (
              <button
                onClick={logoutUser}
                className="glass-button secondary"
                style={{
                  height: '38px',
                  padding: '0 16px',
                  borderRadius: '10px'
                }}
                title="Sign Out"
              >
                <LogOut size={16} /> <span style={{ fontSize: '0.85rem' }}>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Website Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="container animate-fade-in" style={{
          marginTop: '32px',
          paddingBottom: '48px',
          width: '100%',
          flex: 1
        }}>
          {user ? (
            <>
              {user.role === 'customer' && <CustomerView />}
              {user.role === 'security' && <SecurityView />}
              {user.role === 'manager' && <ManagerView />}
            </>
          ) : (
            <AuthView />
          )}
        </div>
      </main>

      {/* Modern Homely Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--card-border)',
        padding: '24px 0',
        textAlign: 'center',
        background: 'rgba(32, 84, 70, 0.02)'
      }}>
        <div className="container">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} SmartFlow Bank Queue Optimizer • Branch Operations Portal • Accra, Ghana
          </p>
        </div>
      </footer>
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
