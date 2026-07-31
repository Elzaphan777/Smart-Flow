import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Clock, Smile, Power, Play, Trash2, Bell, AlertCircle, RefreshCw, Landmark, ShieldCheck } from 'lucide-react';

export default function ManagerView() {
  const { 
    counters, 
    stats, 
    notifications, 
    serveCustomer, 
    toggleCounterStatus, 
    clearNotifications,
    resetSimulator
  } = useApp();

  // Compute active queues totals
  const totalWaiting = counters.reduce((sum, c) => sum + (c.isOpen ? c.customers.length : 0), 0);

  return (
    <div className="manager-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top operational controls banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge secondary" style={{ marginBottom: '6px' }}>Operations Desk</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Branch Operations Manager</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time branch loading analytics, teller window administration, and operational event log.
          </p>
        </div>

        <button 
          onClick={resetSimulator}
          className="glass-button secondary"
          style={{ 
            padding: '10px 16px', 
            borderRadius: '10px', 
            fontSize: '0.8rem', 
            borderColor: 'var(--color-danger)', 
            color: 'var(--color-danger)',
            background: 'rgba(185, 28, 28, 0.05)'
          }}
        >
          <RefreshCw size={14} /> Reset Operations Data
        </button>
      </div>

      {/* Analytics Overview 4-Column Grid */}
      <div className="grid-4">
        {/* Served Today - Organic Emerald Theme */}
        <div className="glass-panel organic-panel" style={{ padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', marginBottom: '10px' }}>
            <Users size={20} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>SERVED TODAY</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px' }}>{stats.totalServed}</h3>
          <span className="badge" style={{ fontSize: '0.6rem', marginTop: '8px' }}>Active Session</span>
        </div>

        {/* Avg Wait Time - Organic Terracotta Theme */}
        <div className="glass-panel organic-panel-terracotta" style={{ padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', marginBottom: '10px' }}>
            <Clock size={20} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.9 }}>AVG WAIT TIME</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px' }}>{stats.avgWaitTime.toFixed(1)}m</h3>
          <span className="badge" style={{ fontSize: '0.6rem', marginTop: '8px' }}>Target &lt; 5m</span>
        </div>

        {/* Customer Satisfaction - Clean Glass Panel */}
        <div className="glass-panel" style={{ padding: '20px 24px', textAlign: 'center', background: 'var(--card-bg)' }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.08)', color: 'var(--color-highlight)', marginBottom: '10px' }}>
            <Smile size={20} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>SATISFACTION RATE</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{stats.satisfaction}%</h3>
          <span className="badge success" style={{ fontSize: '0.6rem', marginTop: '8px' }}>Excellent Score</span>
        </div>

        {/* Currently Waiting - Clean Glass Panel */}
        <div className="glass-panel" style={{ padding: '20px 24px', textAlign: 'center', background: 'var(--card-bg)' }}>
          <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'var(--color-accent-light)', color: 'var(--color-accent)', marginBottom: '10px' }}>
            <Users size={20} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>IN BRANCH QUEUES</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{totalWaiting}</h3>
          <span className="badge primary" style={{ fontSize: '0.6rem', marginTop: '8px' }}>Awaiting Routing</span>
        </div>
      </div>

      {/* Main Grid: Counter Admin on Left, Live logs on Right */}
      <div className="grid-2">
        {/* Left Column: Teller Stations Administration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <Landmark size={20} style={{ color: 'var(--color-accent)' }} /> Teller Station Administration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {counters.map(counter => (
              <div key={counter.id} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderLeft: counter.isOpen ? '5px solid var(--color-accent)' : '5px solid var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      {counter.name}
                      <span className={`badge ${counter.isOpen ? 'success' : 'danger'}`} style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                        {counter.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Window {counter.windowNumber} • Specialties: <strong>{counter.type}</strong>
                    </p>
                  </div>
                  
                  {/* Status Toggle Button */}
                  <button 
                    onClick={() => toggleCounterStatus(counter.id)}
                    className="glass-button"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      borderColor: counter.isOpen ? 'var(--color-danger)' : 'var(--color-accent)',
                      color: counter.isOpen ? 'var(--color-danger)' : 'var(--color-accent)',
                      background: counter.isOpen ? 'rgba(185, 28, 28, 0.03)' : 'rgba(32, 84, 70, 0.03)'
                    }}
                  >
                    <Power size={14} />
                    {counter.isOpen ? 'Close Window' : 'Open Window'}
                  </button>
                </div>

                {counter.isOpen && (
                  <div style={{ 
                    borderTop: '1px solid var(--card-border)', 
                    paddingTop: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px' 
                  }}>
                    {counter.customers.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(32, 84, 70, 0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                        No customers assigned to this window yet. Waiting for Security routing.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Next in line */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          background: 'var(--color-accent-light)',
                          padding: '14px 18px',
                          borderRadius: '14px',
                          border: '1px solid var(--card-border)'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                              NOW SERVING NEXT
                            </span>
                            <p style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-accent)', marginTop: '2px' }}>
                              {counter.customers[0].ticketNumber}
                            </p>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                              {counter.customers[0].name}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => serveCustomer(counter.id, counter.customers[0].id)}
                            className="glass-button primary"
                            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', height: '36px' }}
                          >
                            <Play size={14} /> Call & Serve
                          </button>
                        </div>

                        {/* Waiting list preview */}
                        {counter.customers.length > 1 && (
                          <div style={{
                            background: 'rgba(32, 84, 70, 0.02)',
                            padding: '12px 16px',
                            borderRadius: '12px'
                          }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '6px' }}>
                              Queue Backlog ({counter.customers.length - 1} pending):
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {counter.customers.slice(1).map(cust => (
                                <span key={cust.id} className="badge primary" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                  {cust.ticketNumber} ({cust.name.split(' ')[0]})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Operational logs and Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              <Bell size={20} style={{ color: 'var(--color-secondary)' }} /> Operational Event Feed
            </h3>
            <button 
              onClick={clearNotifications}
              className="glass-button secondary"
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', height: '32px' }}
            >
              <Trash2 size={14} /> Clear Log Feed
            </button>
          </div>

          <div className="glass-panel" style={{
            padding: '20px 24px',
            maxHeight: '520px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--card-bg)'
          }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={36} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.85rem' }}>Operational logs are currently empty.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--card-border)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{
                    color: notif.type === 'vip' || notif.type === 'served' ? 'var(--color-success)' : 
                           notif.type === 'assignment' ? 'var(--color-accent)' : 
                           notif.type === 'system' ? 'var(--color-secondary)' : 'var(--text-secondary)',
                    marginTop: '3px'
                  }}>
                    <AlertCircle size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{notif.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{notif.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
