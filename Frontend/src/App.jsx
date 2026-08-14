import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import CustomerView from './components/CustomerView';
import TellerView from './components/TellerView';
import ManagerView from './components/ManagerView';
import AuthView from './components/AuthView';
import { Sun, Moon, Bell, LogOut, Landmark, User, Shield, Users, ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';

function AppContent() {
  const { theme, toggleTheme, notifications, user, logoutUser, loginUser, setActiveRole } = useApp();

  // Initialize currentPortal state based on existing user session, default to "home"
  const [currentPortal, setCurrentPortal] = useState(() => {
    const savedUser = localStorage.getItem('smartflow-user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === 'customer') return 'customer';
      if (parsed.role === 'security') return 'teller';
      if (parsed.role === 'manager') return 'admin';
    }
    return 'home';
  });

  // Sync currentPortal when user logs out manually
  useEffect(() => {
    if (!user && currentPortal !== 'home') {
      // If no user is logged in, we only send back to home if we are in admin or teller role and not simulating
      if (currentPortal === 'admin') {
        setCurrentPortal('home');
      }
    }
  }, [user, currentPortal]);

  // Handle automatic admin login
  useEffect(() => {
    if (currentPortal === 'admin') {
      if (!user || user.role !== 'manager') {
        loginUser('TLR001', 'Teller@1234');
      }
    }
  }, [currentPortal, user, loginUser]);

  const handleLogout = () => {
    logoutUser();
    setCurrentPortal('home');
  };

  const handlePortalSwitch = (portal) => {
    setCurrentPortal(portal);
    if (portal === 'customer') {
      setActiveRole('customer');
    } else if (portal === 'teller') {
      setActiveRole('security');
    } else if (portal === 'admin') {
      setActiveRole('manager');
    }
  };

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
          {/* Logo Brand (Clickable to send to homepage) */}
          <div 
            onClick={() => setCurrentPortal('home')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            title="Go to Homepage"
          >
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

          {/* Quick Portal Switcher Toggle */}
          {currentPortal !== 'home' && (
            <div style={{
              display: 'flex',
              background: 'rgba(32, 84, 70, 0.04)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '3px',
              gap: '2px',
              margin: '0 16px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => handlePortalSwitch('customer')}
                className="glass-button"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  border: 'none',
                  height: '32px',
                  boxShadow: currentPortal === 'customer' ? 'var(--shadow-sm)' : 'none',
                  background: currentPortal === 'customer' ? 'var(--color-accent)' : 'transparent',
                  color: currentPortal === 'customer' ? (theme === 'light' ? '#FFFFFF' : '#052e16') : 'var(--text-secondary)'
                }}
              >
                Customer
              </button>
              <button
                onClick={() => handlePortalSwitch('teller')}
                className="glass-button"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  border: 'none',
                  height: '32px',
                  boxShadow: currentPortal === 'teller' ? 'var(--shadow-sm)' : 'none',
                  background: currentPortal === 'teller' ? 'var(--color-accent)' : 'transparent',
                  color: currentPortal === 'teller' ? (theme === 'light' ? '#FFFFFF' : '#052e16') : 'var(--text-secondary)'
                }}
              >
                Teller
              </button>
              <button
                onClick={() => handlePortalSwitch('admin')}
                className="glass-button"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  border: 'none',
                  height: '32px',
                  boxShadow: currentPortal === 'admin' ? 'var(--shadow-sm)' : 'none',
                  background: currentPortal === 'admin' ? 'var(--color-accent)' : 'transparent',
                  color: currentPortal === 'admin' ? (theme === 'light' ? '#FFFFFF' : '#052e16') : 'var(--text-secondary)'
                }}
              >
                Admin
              </button>
            </div>
          )}

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
                onClick={handleLogout}
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
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Back Navigation Bar (Top-left back arrow) */}
          {currentPortal !== 'home' && (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPortal('home')}
                className="glass-button secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  height: '36px',
                  border: '1px solid var(--card-border)'
                }}
                title="Back to Homepage"
              >
                <ArrowLeft size={16} /> Back to Homepage
              </button>
            </div>
          )}

          {/* Portal Rendering Logic */}
          {currentPortal === 'home' ? (
            <div className="portal-selection-view animate-fade-in" style={{ width: '100%', margin: 'auto 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="badge primary" style={{ marginBottom: '14px' }}>SmartFlow Ecosystem</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                  Interactive Banking Portals
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px', margin: '8px auto' }}>
                  Please select one of the customized portal environments below to interact with the queue optimization platform.
                </p>
              </div>

              <div className="grid-3" style={{ maxWidth: '1100px', margin: '0 auto', gap: '24px' }}>
                {/* Customer Portal */}
                <div className="glass-panel interactive" style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'var(--color-accent-light)',
                    color: 'var(--color-accent)'
                  }}>
                    <User size={30} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>Customer Portal</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                      Join the digital lobby queue, print physical-style bank tickets, track wait times, and locate active specialist tellers.
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePortalSwitch('customer')}
                    className="glass-button primary" 
                    style={{ marginTop: 'auto', width: '100%', height: '44px', borderRadius: '10px' }}
                  >
                    Enter Kiosk <ArrowRight size={16} />
                  </button>
                </div>

                {/* Teller Portal */}
                <div className="glass-panel interactive" style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'var(--color-secondary-light)',
                    color: 'var(--color-secondary)'
                  }}>
                    <Users size={30} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>Teller Terminal</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                      Manage simulated window desks, toggle breaks, call guests from the lobby, record resolution logs, and complete tickets.
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePortalSwitch('teller')}
                    className="glass-button secondary" 
                    style={{ marginTop: 'auto', width: '100%', height: '44px', borderRadius: '10px' }}
                  >
                    Enter Desks <ArrowRight size={16} />
                  </button>
                </div>

                {/* Manager/Admin Portal */}
                <div className="glass-panel interactive" style={{ padding: '36px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'var(--color-accent-light)',
                    color: 'var(--color-highlight)'
                  }}>
                    <Shield size={30} style={{ color: 'var(--color-highlight)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>Operations Admin</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                      Monitor real-time branch performance metrics, open/close service counters, view live audit logs, and clear dashboard data.
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePortalSwitch('admin')}
                    className="glass-button primary" 
                    style={{ marginTop: 'auto', width: '100%', height: '44px', borderRadius: '10px', background: 'var(--color-highlight)', color: '#FFFFFF' }}
                  >
                    Enter Admin Desk <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentPortal === 'customer' && <CustomerView />}
              {currentPortal === 'teller' && <TellerView />}
              {currentPortal === 'admin' && <ManagerView />}
            </>
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
