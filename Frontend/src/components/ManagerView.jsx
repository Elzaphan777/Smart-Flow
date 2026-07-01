import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Clock, Smile, Power, Play, Trash2, Bell, AlertCircle, RefreshCw } from 'lucide-react';

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
    <div className="manager-view animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Controls & Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Bank Operations Manager</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time branch loading, teller stats, and alert streams.
          </p>
        </div>
        <button 
          onClick={resetSimulator}
          className="glass-button"
          style={{ 
            padding: '8px 12px', 
            borderRadius: '8px', 
            fontSize: '0.75rem', 
            borderColor: 'var(--color-danger)', 
            color: 'var(--color-danger)',
            background: 'rgba(225, 29, 72, 0.05)'
          }}
        >
          <RefreshCw size={12} /> Reset Data
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '50%', background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', marginBottom: '8px' }}>
            <Users size={18} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Served Today</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '2px' }}>{stats.totalServed}</h3>
        </div>

        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '50%', background: 'var(--color-accent-light)', color: 'var(--color-accent)', marginBottom: '8px' }}>
            <Clock size={18} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Wait Time</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '2px' }}>{stats.avgWaitTime.toFixed(1)}m</h3>
        </div>

        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', marginBottom: '8px' }}>
            <Smile size={18} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Satisfaction</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '2px' }}>{stats.satisfaction}%</h3>
        </div>

        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '8px' }}>
            <Users size={18} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Currently Waiting</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '2px' }}>{totalWaiting}</h3>
        </div>
      </div>

      {/* Main Grid: Teller Administration and Notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Counter Queue Control List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Teller Stations Administration</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {counters.map(counter => (
              <div key={counter.id} className="glass-panel" style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {counter.name}
                      <span className={`badge ${counter.isOpen ? 'primary' : 'danger'}`} style={{ fontSize: '0.6rem' }}>
                        {counter.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{counter.type}</p>
                  </div>
                  
                  {/* Status Toggle Button */}
                  <button 
                    onClick={() => toggleCounterStatus(counter.id)}
                    className="glass-button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      borderColor: counter.isOpen ? 'var(--color-danger)' : 'var(--color-accent)',
                      color: counter.isOpen ? 'var(--color-danger)' : 'var(--color-accent)'
                    }}
                  >
                    <Power size={12} style={{ marginRight: '4px' }} />
                    {counter.isOpen ? 'Close Station' : 'Open Station'}
                  </button>
                </div>

                {counter.isOpen && (
                  <div style={{ 
                    borderTop: '1px solid var(--card-border)', 
                    paddingTop: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}>
                    {counter.customers.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No customers assigned to this counter yet.
                      </p>
                    ) : (
                      <div>
                        {/* Next in line */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          background: 'var(--color-accent-light)',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--card-border)'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-secondary)' }}>
                              Next Customer
                            </span>
                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {counter.customers[0].ticketNumber} — {counter.customers[0].name}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => serveCustomer(counter.id, counter.customers[0].id)}
                            className="glass-button primary"
                            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}
                          >
                            <Play size={12} /> Serve Next
                          </button>
                        </div>

                        {/* Waiting list preview */}
                        {counter.customers.length > 1 && (
                          <div style={{ marginTop: '8px' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>
                              Queue Backlog ({counter.customers.length - 1} more):
                            </p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {counter.customers.slice(1).map(cust => (
                                <span key={cust.id} className="badge secondary" style={{ fontSize: '0.65rem' }}>
                                  {cust.ticketNumber}
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

        {/* Live Branch Logs & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={18} /> Live Operational Feed
            </h3>
            <button 
              onClick={clearNotifications}
              className="glass-button"
              style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', height: '28px' }}
            >
              <Trash2 size={12} /> Clear Feed
            </button>
          </div>

          <div className="glass-panel" style={{
            padding: '16px',
            maxHeight: '260px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {notifications.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                Operational log is currently clear.
              </p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--card-border)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{
                    color: notif.type === 'vip' ? 'var(--color-danger)' : 
                           notif.type === 'assignment' ? 'var(--color-accent)' : 
                           notif.type === 'served' ? 'var(--color-success)' : 'var(--text-secondary)',
                    marginTop: '2px'
                  }}>
                    <AlertCircle size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '700' }}>{notif.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{notif.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>{notif.message}</p>
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
