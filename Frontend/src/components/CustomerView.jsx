import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, User, Phone, Building, Layers, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const GH_BANKS = [
  'GCB Bank',
  'Ecobank Ghana',
  'Stanbic Bank',
  'Absa Bank Ghana',
  'Fidelity Bank Ghana',
  'CalBank',
  'Zenith Bank Ghana'
];

const VISIT_PURPOSES = [
  'Cash Deposits',
  'Cash Withdrawals',
  'Account Enquiries',
  'Mobile Money / Forex',
  'Loans & Credit Services',
  'Card Issues / Password Reset'
];

export default function CustomerView() {
  const { activeTicket, addCheckIn, counters, checkIns } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bank: GH_BANKS[0],
    purpose: VISIT_PURPOSES[0],
    isVip: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    addCheckIn(formData);
  };

  // Calculate wait position if assigned to a counter
  const getQueuePosition = () => {
    if (!activeTicket || !activeTicket.assignedCounterId) return null;
    const assignedCounter = counters.find(c => c.id === activeTicket.assignedCounterId);
    if (!assignedCounter) return 0;
    
    // Find index of this customer in the counter queue
    const idx = assignedCounter.customers.findIndex(c => c.ticketNumber === activeTicket.ticketNumber);
    return idx >= 0 ? idx + 1 : 1;
  };

  const position = getQueuePosition();

  return (
    <div className="customer-view animate-fade-in" style={{ padding: '16px' }}>
      {!activeTicket ? (
        <div className="glass-panel" style={{ padding: '24px', margin: '0 auto', maxWidth: '450px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              marginBottom: '12px'
            }}>
              <Ticket size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Ghana Branch Check-In</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Welcome to Smart Flow. Please check in to join the queue.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div className="glass-panel" style={{
                padding: '12px',
                borderColor: 'var(--color-danger)',
                background: 'rgba(225, 29, 72, 0.05)',
                color: 'var(--color-danger)',
                fontSize: '0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Kofi Mensah"
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0244123456"
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Your Bank
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
                <select
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ paddingLeft: '44px', appearance: 'none', cursor: 'pointer' }}
                >
                  {GH_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Purpose of Visit
              </label>
              <div style={{ position: 'relative' }}>
                <Layers size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-secondary)' }} />
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ paddingLeft: '44px', appearance: 'none', cursor: 'pointer' }}
                >
                  {VISIT_PURPOSES.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <input
                type="checkbox"
                id="isVip"
                name="isVip"
                checked={formData.isVip}
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  accentColor: 'var(--color-accent)'
                }}
              />
              <label htmlFor="isVip" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                I am a senior citizen / require priority assistance
              </label>
            </div>

            <button type="submit" className="glass-button primary" style={{ width: '100%', marginTop: '8px' }}>
              Join Queue <ArrowRight size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Virtual Ticket */}
          <div className="glass-panel animate-fade-in" style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '30px 24px',
            border: '2px dashed var(--card-border)',
            borderRadius: '24px',
            background: 'var(--card-bg)'
          }}>
            {/* Top cutouts for ticket look */}
            <div style={{
              position: 'absolute',
              left: '-15px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              borderRight: '1px solid var(--card-border)',
              zIndex: 5
            }}></div>
            <div style={{
              position: 'absolute',
              right: '-15px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--bg-primary)',
              borderLeft: '1px solid var(--card-border)',
              zIndex: 5
            }}></div>

            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--card-border)', paddingBottom: '20px', marginBottom: '20px' }}>
              <span className={`badge ${activeTicket.isVip ? 'danger' : 'primary'}`} style={{ marginBottom: '8px' }}>
                {activeTicket.isVip ? '⭐ Priority Ticket' : 'Standard Ticket'}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeTicket.bank}</p>
              <h1 style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '2px', color: 'var(--color-accent)', margin: '8px 0' }}>
                {activeTicket.ticketNumber}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>{activeTicket.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Purpose: {activeTicket.purpose}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeTicket.status === 'checked_in' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.2)',
                  color: 'var(--color-highlight)'
                }}>
                  <Clock size={20} className="animate-pulse-soft" />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Awaiting Counter Assignment</h4>
                    <p style={{ fontSize: '0.75rem', opacity: '0.85', marginTop: '2px' }}>
                      Please check in with the security desk or wait for assignment.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'var(--color-accent-light)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--color-accent)'
                  }}>
                    <CheckCircle size={22} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Counter Assigned!</h4>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                        Proceed to: {counters.find(c => c.id === activeTicket.assignedCounterId)?.name || 'Assigned Counter'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div className="glass-panel" style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Position in Line</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                        #{position !== null ? position : '--'}
                      </p>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated Wait</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                        {position !== null ? `${position * 3} mins` : '--'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginTop: '12px',
                borderTop: '1px solid var(--card-border)',
                paddingTop: '12px'
              }}>
                Entry time: {activeTicket.checkInTime} • Thank you for banking with us.
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Note: This is a secure check-in. In keeping with bank policy, customer views are restricted to active ticket info only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
