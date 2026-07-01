import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Shuffle, ArrowRight, UserPlus, ShieldAlert, Award, Inbox } from 'lucide-react';

export default function SecurityView() {
  const { checkIns, counters, directCustomer } = useApp();

  // Filter customers who just checked in and are awaiting counter direction
  const pendingCustomers = checkIns.filter(cust => cust.status === 'checked_in');

  // Find the open counter with the shortest queue
  const getShortestQueueCounter = (purpose) => {
    // Determine which counters are open
    const openCounters = counters.filter(c => c.isOpen);
    if (openCounters.length === 0) return null;

    // Filter by relevance of counter type, if applicable, otherwise just pick shortest overall
    // Tellers 1 & 2 do Deposits/Withdrawals, Teller 3 Enquiries, Customer Service does Loans
    let relevantCounters = openCounters;
    
    if (purpose.includes('Deposit') || purpose.includes('Withdrawal')) {
      relevantCounters = openCounters.filter(c => c.id === 'counter-1' || c.id === 'counter-2');
    } else if (purpose.includes('Enquir') || purpose.includes('Forex')) {
      relevantCounters = openCounters.filter(c => c.id === 'counter-3');
    } else if (purpose.includes('Loan') || purpose.includes('Card')) {
      relevantCounters = openCounters.filter(c => c.id === 'counter-4');
    }

    // Fallback if all specific relevant counters are closed
    if (relevantCounters.length === 0) {
      relevantCounters = openCounters;
    }

    // Sort by number of customers ascending
    return relevantCounters.reduce((prev, curr) => 
      prev.customers.length <= curr.customers.length ? prev : curr
    , relevantCounters[0]);
  };

  return (
    <div className="security-view animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Security Router Panel</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Direct incoming bank customers to the shortest teller queue.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          padding: '8px 16px',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.85rem'
        }}>
          <UserCheck size={18} />
          <span>{pendingCustomers.length} Awaiting Direction</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Pending Check-ins Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} /> New Arrivals
          </h3>

          {pendingCustomers.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-secondary)'
            }}>
              <Inbox size={36} style={{ strokeWidth: 1.5, opacity: 0.6 }} />
              <div>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>All Checked In</p>
                <p style={{ fontSize: '0.8rem', marginTop: '2px' }}>Waiting for new entries at the portal.</p>
              </div>
            </div>
          ) : (
            pendingCustomers.map(customer => {
              const bestCounter = getShortestQueueCounter(customer.purpose);
              return (
                <div key={customer.id} className="glass-panel animate-fade-in" style={{
                  padding: '20px',
                  borderLeft: customer.isVip ? '4px solid var(--color-danger)' : '4px solid var(--color-secondary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-secondary)' }}>
                          {customer.ticketNumber}
                        </span>
                        {customer.isVip && (
                          <span className="badge danger" style={{ fontSize: '0.65rem' }}>
                            <Award size={10} /> Priority / VIP
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '0.95rem', margin: '4px 0 2px 0' }}>{customer.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {customer.bank} • <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{customer.purpose}</span>
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{customer.checkInTime}</span>
                  </div>

                  {bestCounter ? (
                    <div style={{
                      background: 'var(--color-accent-light)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shuffle size={18} style={{ color: 'var(--color-accent)' }} />
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recommended Counter</p>
                          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-accent)' }}>
                            {bestCounter.name} ({bestCounter.customers.length} waiting)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => directCustomer(customer.id, bestCounter.id)}
                        className="glass-button primary"
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
                      >
                        Route <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(225, 29, 72, 0.08)',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--color-danger)',
                      fontSize: '0.8rem'
                    }}>
                      <ShieldAlert size={16} />
                      <span>All counters are currently closed! Open them in Manager View.</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Counters Overview Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Counter Loads</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {counters.map(counter => (
              <div key={counter.id} className="glass-panel" style={{
                padding: '16px',
                opacity: counter.isOpen ? 1 : 0.6,
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{counter.name}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{counter.type}</p>
                  </div>
                  <span className={`badge ${counter.isOpen ? 'primary' : 'danger'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                    {counter.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '12px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {counter.isOpen ? counter.customers.length : '--'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {counter.isOpen ? 'in queue' : 'inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
