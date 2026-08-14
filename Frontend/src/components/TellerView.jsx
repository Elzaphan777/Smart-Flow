import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  CheckCircle, 
  Coffee, 
  User, 
  Clock, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Power,
  ChevronRight
} from 'lucide-react';

export default function TellerView() {
  const { 
    counters, 
    user, 
    loginUser, 
    callTicket, 
    completeTicket, 
    toggleTellerAvailability, 
    toggleCounterStatus,
    approveAndDirectTicket,
    checkIns
  } = useApp();

  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter tellers from counters (excluding the manager TLR001)
  const tellersList = counters.filter(c => c.staffId !== 'TLR001');

  // Check if current logged-in user is a teller (security role represents teller desk here)
  const isTellerLoggedIn = user && user.role === 'security';
  
  // Find current teller's counter data
  const currentCounter = isTellerLoggedIn 
    ? counters.find(c => c.staffId === user.staffId) 
    : null;

  const handleSelectTeller = (staffId) => {
    setError('');
    setSuccess('');
    loginUser(staffId, 'Teller@1234');
  };

  const handleApproveAndDirect = async (ticketId) => {
    if (!currentCounter) return;
    setLoading(true);
    setError('');
    const res = await approveAndDirectTicket(user.staffId, ticketId);
    setLoading(false);
    if (res.success) {
      setSuccess('Ticket directed to your window queue!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message);
    }
  };

  const handleToggleAvailability = async () => {
    if (!currentCounter) return;
    setLoading(true);
    setError('');
    const newAvailable = !currentCounter.isAvailable;
    const res = await toggleTellerAvailability(user.staffId, newAvailable);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleTogglePower = async () => {
    if (!currentCounter) return;
    setLoading(true);
    setError('');
    await toggleCounterStatus(currentCounter.id);
    setLoading(false);
  };

  const handleCall = async (ticketId) => {
    if (!currentCounter) return;
    setLoading(true);
    setError('');
    const res = await callTicket(user.staffId, ticketId);
    setLoading(false);
    if (res.success) {
      setNotes('');
    } else {
      setError(res.message);
    }
  };

  const handleComplete = async (ticketId) => {
    if (!currentCounter) return;
    setLoading(true);
    setError('');
    const res = await completeTicket(user.staffId, ticketId, notes);
    setLoading(false);
    if (res.success) {
      setNotes('');
      setSuccess('Service completed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.message);
    }
  };

  // If no teller is logged in, show selection screen
  if (!isTellerLoggedIn) {
    return (
      <div className="teller-select-view animate-fade-in" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge primary" style={{ marginBottom: '12px' }}>Staff Portal</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', color: 'var(--color-accent)' }}>
            Teller Desk Simulator
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px', margin: '8px auto' }}>
            Select one of the active branch teller stations to open its operational terminal and manage client queues.
          </p>
        </div>

        <div className="grid-2" style={{ maxWidth: '900px', margin: '0 auto', gap: '20px' }}>
          {tellersList.map(teller => {
            const isFree = teller.isOpen && teller.isAvailable;
            return (
              <div 
                key={teller.id} 
                className="glass-panel interactive" 
                onClick={() => handleSelectTeller(teller.staffId)}
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  borderLeft: isFree ? '5px solid var(--color-accent)' : '5px solid var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {teller.name.split(' (')[0]}
                    </h4>
                    <span className={`badge ${isFree ? 'success' : 'danger'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                      {isFree ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Station {teller.windowNumber} • Staff ID: <strong>{teller.staffId}</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', opacity: 0.9 }}>
                    Specialties: <em>{teller.type}</em>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Queue Size</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: isFree ? 'var(--color-accent)' : 'var(--text-secondary)' }}>
                      {isFree ? teller.customers.length : '--'}
                    </p>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // If current counter data is not loaded yet
  if (!currentCounter) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Clock size={36} className="animate-spin" />
        <p style={{ marginTop: '12px' }}>Loading teller station profile...</p>
      </div>
    );
  }

  const activeCustomers = currentCounter.customers || [];
  const servingCustomer = activeCustomers.find(c => c.status === 'serving');
  const waitingCustomers = activeCustomers.filter(c => c.status === 'waiting');

  return (
    <div className="teller-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Info Banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge primary" style={{ marginBottom: '6px' }}>Station Terminal</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Station {currentCounter.windowNumber} Terminal
            <span className={`badge ${(currentCounter.isOpen && currentCounter.isAvailable) ? 'success' : 'danger'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {(currentCounter.isOpen && currentCounter.isAvailable) ? 'Online' : 'Offline'}
            </span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Desk Specialties: <strong>{currentCounter.type}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Availability Toggle */}
          <button 
            onClick={handleToggleAvailability}
            disabled={loading || !currentCounter.isOpen}
            className={`glass-button ${currentCounter.isAvailable ? 'secondary' : ''}`}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              opacity: currentCounter.isOpen ? 1 : 0.6
            }}
          >
            {currentCounter.isAvailable ? (
              <>
                <UserCheck size={16} /> <span>Available</span>
              </>
            ) : (
              <>
                <Coffee size={16} /> <span>On Break</span>
              </>
            )}
          </button>

          {/* Open/Close Toggle */}
          <button 
            onClick={handleTogglePower}
            disabled={loading}
            className="glass-button"
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              borderColor: currentCounter.isOpen ? 'var(--color-danger)' : 'var(--color-accent)',
              color: currentCounter.isOpen ? 'var(--color-danger)' : 'var(--color-accent)',
              background: currentCounter.isOpen ? 'rgba(185, 28, 28, 0.05)' : 'rgba(32, 84, 70, 0.05)'
            }}
          >
            <Power size={16} />
            <span>{currentCounter.isOpen ? 'Close Station' : 'Open Station'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{
          padding: '14px 20px',
          borderColor: 'var(--color-danger)',
          background: 'rgba(185, 28, 28, 0.05)',
          color: 'var(--color-danger)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="glass-panel" style={{
          padding: '14px 20px',
          borderColor: 'var(--color-success)',
          background: 'rgba(21, 128, 61, 0.05)',
          color: 'var(--color-success)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid-2">
        {/* Left Column: Serving Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <UserCheck size={20} style={{ color: 'var(--color-accent)' }} /> Customer Service Action
          </h3>

          {!currentCounter.isOpen ? (
            <div className="glass-panel" style={{ padding: '48px 30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Power size={48} style={{ opacity: 0.3, marginBottom: '14px' }} />
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Station is Closed</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Open this station using the power button in the top right to start serving queue arrivals.
              </p>
            </div>
          ) : servingCustomer ? (
            <div className="glass-panel" style={{ padding: '30px', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span className="badge secondary" style={{ marginBottom: '8px' }}>Active Service</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-secondary)' }}>
                    {servingCustomer.ticketNumber}
                  </h4>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px', color: 'var(--text-primary)' }}>
                    {servingCustomer.name}
                  </h3>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  <Clock size={14} className="animate-spin-slow" />
                  <span>Serving Live</span>
                </div>
              </div>

              <div style={{ 
                borderTop: '1px solid var(--card-border)', 
                borderBottom: '1px solid var(--card-border)', 
                padding: '16px 0', 
                marginBottom: '20px', 
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <p>Service Type: <strong style={{ color: 'var(--text-primary)' }}>{servingCustomer.purpose}</strong></p>
                <p>Origin: <strong style={{ color: 'var(--text-primary)' }}>{servingCustomer.bank || 'GCB Bank'}</strong></p>
              </div>

              {/* Service Completion Notes Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Service Notes / Resolution Details
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Cleared foreign exchange draft, converted USD to GHS."
                      className="glass-input"
                      style={{ paddingLeft: '44px', height: '46px' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleComplete(servingCustomer.id)}
                  disabled={loading}
                  className="glass-button primary"
                  style={{ width: '100%', height: '46px', borderRadius: '12px', fontSize: '0.95rem' }}
                >
                  <CheckCircle size={18} /> Complete & Free Station
                </button>
              </div>
            </div>
          ) : waitingCustomers.length > 0 ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '50%',
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
                marginBottom: '16px'
              }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Customer Ready in Queue</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '300px', margin: '6px auto 20px auto' }}>
                Next customer in line: <strong>{waitingCustomers[0].ticketNumber}</strong> ({waitingCustomers[0].name}). Call them to your station to begin service.
              </p>

              <button
                onClick={() => handleCall(waitingCustomers[0].id)}
                disabled={loading || !currentCounter.isAvailable}
                className="glass-button primary animate-pulse-soft"
                style={{ width: '100%', height: '46px', borderRadius: '12px', fontSize: '0.95rem' }}
              >
                <Play size={18} /> Call & Serve Next Guest
              </button>
              
              {!currentCounter.isAvailable && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-highlight)', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <AlertTriangle size={12} /> Make yourself "Available" above to call the next guest.
                </p>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '48px 30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={48} style={{ opacity: 0.3, marginBottom: '14px', color: 'var(--color-accent)' }} />
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Lobby Queue Clear</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                No customers are currently assigned to your station queue. Take a quick break or wait for security check-ins.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Window Queue Backlog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <Users size={20} style={{ color: 'var(--color-secondary)' }} /> Station Queue Backlog
          </h3>

          <div className="glass-panel" style={{ padding: '24px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--card-bg)' }}>
            {waitingCustomers.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No pending customers in backlog.</p>
              </div>
            ) : (
              waitingCustomers.map((cust, idx) => (
                <div key={cust.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: idx < waitingCustomers.length - 1 ? '1px solid var(--card-border)' : 'none',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-accent)' }}>{cust.ticketNumber}</span>
                      <span className="badge primary" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{cust.purpose}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', marginTop: '4px', fontWeight: '600' }}>{cust.name}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Origin: {cust.bank}</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Position: #{idx + 1}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Est: { (idx + 1) * 3 }m
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Available Tickets in Branch Panel (Self-Assignment) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              <UserCheck size={20} style={{ color: 'var(--color-accent)' }} /> Available Tickets in Branch
            </h3>

            <div className="glass-panel" style={{ padding: '24px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--card-bg)', boxShadow: 'none' }}>
              {checkIns.filter(t => t.status === 'checked_in').length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No unassigned lobby tickets available.</p>
                </div>
              ) : (
                checkIns.filter(t => t.status === 'checked_in').map((t, idx, arr) => (
                  <div key={t.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '12px',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--card-border)' : 'none',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--color-secondary)' }}>{t.ticketNumber}</span>
                        {t.isVip && (
                          <span className="badge secondary" style={{ fontSize: '0.55rem', padding: '1px 6px' }}>⭐ VIP</span>
                        )}
                        <span className="badge primary" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{t.purpose}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', marginTop: '4px', fontWeight: '600' }}>{t.name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Check-in: {t.checkInTime} • Bank: {t.bank}</p>
                    </div>

                    <button
                      onClick={() => handleApproveAndDirect(t.id)}
                      disabled={loading || !currentCounter.isAvailable || !currentCounter.isOpen}
                      className="glass-button primary"
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', height: '32px' }}
                    >
                      Approve & Direct
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
