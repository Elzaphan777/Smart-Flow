import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Shuffle, ArrowRight, UserPlus, ShieldAlert, Award, Inbox, Users, Check } from 'lucide-react';

export default function SecurityView() {
  const { checkIns, counters, directCustomer } = useApp();

  // Filter customers who just checked in and are awaiting counter direction
  const pendingCustomers = checkIns.filter(cust => cust.status === 'checked_in');

  // Find the open counter with the shortest queue
  const getShortestQueueCounter = (purpose) => {
    const openCounters = counters.filter(c => c.isOpen);
    if (openCounters.length === 0) return null;

    let relevantCounters = openCounters;
    
    if (purpose.includes('Deposit') || purpose.includes('Withdrawal')) {
      // Find counters that handle deposits/withdrawals
      relevantCounters = openCounters.filter(c => 
        c.type.toLowerCase().includes('deposit') || 
        c.type.toLowerCase().includes('withdrawal') || 
        c.type.toLowerCase().includes('general')
      );
    } else if (purpose.includes('Enquir') || purpose.includes('Forex')) {
      relevantCounters = openCounters.filter(c => 
        c.type.toLowerCase().includes('enquir') || 
        c.type.toLowerCase().includes('forex') || 
        c.type.toLowerCase().includes('general')
      );
    } else if (purpose.includes('Loan') || purpose.includes('Card')) {
      relevantCounters = openCounters.filter(c => 
        c.type.toLowerCase().includes('loan') || 
        c.type.toLowerCase().includes('card') || 
        c.type.toLowerCase().includes('customer')
      );
    }

    if (relevantCounters.length === 0) {
      relevantCounters = openCounters;
    }

    return relevantCounters.reduce((prev, curr) => 
      prev.customers.length <= curr.customers.length ? prev : curr
    , relevantCounters[0]);
  };

  return (
    <div className="security-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Welcome Panel */}
      <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge primary" style={{ marginBottom: '6px' }}>Lobby Operations</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Security Routing Terminal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Welcome arrivals, verify customer details, and dispatch them to the optimal window load.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          padding: '12px 20px',
          borderRadius: '16px',
          fontWeight: '700',
          fontSize: '0.9rem',
          border: '1px solid var(--card-border)'
        }}>
          <UserCheck size={20} />
          <span>{pendingCustomers.length} Guests Awaiting Desk Routing</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid-2">
        {/* Left Column: New Arrivals (Lobby Queue) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <UserPlus size={20} style={{ color: 'var(--color-secondary)' }} /> New Branch Arrivals
          </h3>

          {pendingCustomers.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '60px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
                marginBottom: '4px'
              }}>
                <Inbox size={32} />
              </div>
              <div>
                <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Lobby is Empty</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '300px' }}>
                  All checked-in guests have been routed to teller windows successfully.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingCustomers.map(customer => {
                const bestCounter = getShortestQueueCounter(customer.purpose);
                return (
                  <div key={customer.id} className="glass-panel interactive" style={{
                    padding: '24px',
                    borderLeft: customer.isVip ? '5px solid var(--color-secondary)' : '5px solid var(--color-accent)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                            {customer.ticketNumber}
                          </span>
                          {customer.isVip && (
                            <span className="badge secondary" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                              <Award size={10} /> Priority VIP
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>
                          {customer.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Phone: {customer.phone}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          Bank: <strong>{customer.bank}</strong> • Branch: {customer.branch || 'Accra Main'}
                        </p>
                        <span className="badge primary" style={{ fontSize: '0.65rem', marginTop: '10px' }}>
                          {customer.purpose}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {customer.checkInTime}
                      </span>
                    </div>

                    {/* Routing Recommendation card */}
                    {bestCounter ? (
                      <div style={{
                        background: 'rgba(32, 84, 70, 0.04)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '16px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Shuffle size={18} style={{ color: 'var(--color-secondary)' }} />
                          <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>RECOMMENDED ROUTE</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-accent)' }}>
                              {bestCounter.name} ({bestCounter.customers.length} in queue)
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => directCustomer(customer.id, bestCounter.id)}
                          className="glass-button primary animate-pulse-soft"
                          style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', height: '36px' }}
                        >
                          Route Now <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(185, 28, 28, 0.06)',
                        padding: '14px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'var(--color-danger)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid rgba(185, 28, 28, 0.15)'
                      }}>
                        <ShieldAlert size={18} />
                        <span>All teller windows are currently closed. Open counters in Manager View.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Counter Loads Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <Users size={20} style={{ color: 'var(--color-accent)' }} /> Active Teller Loads
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {counters.map(counter => (
              <div key={counter.id} className="glass-panel" style={{
                padding: '20px',
                opacity: counter.isOpen ? 1 : 0.65,
                border: counter.isOpen ? '1px solid var(--card-border)' : '1px dashed var(--card-border)',
                background: counter.isOpen ? 'var(--card-bg)' : 'rgba(32, 84, 70, 0.01)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {counter.name.split(' (')[0]}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Window {counter.windowNumber}
                    </p>
                  </div>
                  <span className={`badge ${counter.isOpen ? 'success' : 'danger'}`} style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                    {counter.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Specializations
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {counter.type || 'General Service'}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  borderTop: '1px solid var(--card-border)',
                  paddingTop: '12px'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lobby Line</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: counter.isOpen && counter.customers.length > 3 ? 'var(--color-secondary)' : 'var(--text-primary)' }}>
                      {counter.isOpen ? counter.customers.length : '--'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {counter.isOpen ? 'waiting' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
