import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, User, Phone, Building, Layers, CheckCircle, Clock, AlertTriangle, ArrowRight, MapPin, Landmark, HeartHandshake, ShieldCheck } from 'lucide-react';

const GH_BANKS = [
  'GCB Bank',
  'Ecobank Ghana',
  'Stanbic Bank',
  'Absa Bank Ghana',
  'Fidelity Bank Ghana',
  'CalBank',
  'Zenith Bank Ghana'
];

const BRANCHES_MAP = {
  'GCB Bank': ['Accra High Street', 'Kumasi Main', 'Tamale Main', 'Takoradi Harbour', 'Tema Community 1', 'Sunyani Branch'],
  'Ecobank Ghana': ['Ridge Head Office', 'Spintex Road', 'Osu Branch', 'KNUST Kumasi', 'East Legon', 'Airport City'],
  'Stanbic Bank': ['Silver Star Tower', 'Tema Community 11', 'Adum Kumasi', 'West Hills Mall', 'Airport Residential'],
  'Absa Bank Ghana': ['High Street Accra', 'Osu Cantonments', 'Kumasi Adum', 'Tamale Branch', 'Takoradi Main'],
  'Fidelity Bank Ghana': ['Ridge Towers', 'Spintex Road', 'Ahodwo Kumasi', 'Koforidua Branch', 'Madina Ritz Junction'],
  'CalBank': ['Head Office Accra', 'Kumasi Main', 'Takoradi Branch', 'Tema Main', 'East Legon'],
  'Zenith Bank Ghana': ['Premier Towers', 'Spintex Branch', 'Adum Kumasi', 'East Legon', 'Tema Harbor']
};

const VISIT_PURPOSES = [
  'Cash Deposits',
  'Cash Withdrawals',
  'Account Enquiries',
  'Mobile Money / Forex',
  'Loans & Credit Services',
  'Card Issues / Password Reset'
];

const PURPOSE_TO_SERVICE = {
  'Cash Deposits': 'deposits',
  'Cash Withdrawals': 'withdrawals',
  'Account Enquiries': 'general',
  'Mobile Money / Forex': 'foreign_exchange',
  'Loans & Credit Services': 'loans',
  'Card Issues / Password Reset': 'customer_service'
};

const Barcode = () => {
  const bars = [
    'thick', 'thin', 'medium', 'thick', 'thin', 'thin', 'medium', 'thick',
    'thin', 'medium', 'thin', 'thick', 'medium', 'thin', 'thick', 'thin',
    'thick', 'thin', 'medium', 'thin', 'thick', 'thin'
  ];
  return (
    <div className="barcode">
      {bars.map((bar, i) => (
        <div key={i} className={`barcode-line ${bar}`} />
      ))}
    </div>
  );
};

export default function CustomerView() {
  const { activeTicket, addCheckIn, counters, user } = useApp();
  
  const initialBank = user && user.bank ? user.bank : GH_BANKS[0];
  const initialBranch = BRANCHES_MAP[initialBank] ? BRANCHES_MAP[initialBank][0] : '';

  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    phone: user ? '0241234567' : '',
    bank: initialBank,
    branch: initialBranch,
    purpose: VISIT_PURPOSES[0],
    isVip: false
  });
  const [error, setError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (activeTicket && activeTicket.status === 'completed') {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowFeedback(false);
    }
  }, [activeTicket]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'bank') {
      const nextBranch = BRANCHES_MAP[value] ? BRANCHES_MAP[value][0] : '';
      setFormData(prev => ({
        ...prev,
        bank: value,
        branch: nextBranch
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
    if (!formData.bank) {
      setError('Please select a bank.');
      return;
    }
    if (!formData.branch) {
      setError('Please select a branch.');
      return;
    }
    setError('');
    addCheckIn(formData);
  };

  const getQueuePosition = () => {
    if (!activeTicket || !activeTicket.assignedCounterId) return null;
    const assignedCounter = counters.find(c => c.id === activeTicket.assignedCounterId);
    if (!assignedCounter) return 0;
    
    const idx = assignedCounter.customers.findIndex(c => c.ticketNumber === activeTicket.ticketNumber);
    return idx >= 0 ? idx + 1 : 1;
  };

  const position = getQueuePosition();
  const openCounters = counters.filter(c => c.isOpen);
  
  const serviceType = activeTicket ? (PURPOSE_TO_SERVICE[activeTicket.purpose] || 'general') : 'general';
  const handlingCounters = counters.filter(c => c.specializations && c.specializations.includes(serviceType));
  const handlingStationsStr = handlingCounters.map(c => `Station ${c.windowNumber}`).join(', ');

  return (
    <div className="customer-view animate-fade-in" style={{ width: '100%' }}>
      {!activeTicket ? (
        <div className="grid-2">
          {/* Left Column: Welcoming Brand Intro (Homely & Approchable) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px',
            gap: '24px'
          }}>
            <div>
              <span className="badge primary" style={{ marginBottom: '12px' }}>Welcome to SmartFlow</span>
              <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2', color: 'var(--color-accent)', fontWeight: '700' }}>
                Your comfort is our top priority.
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '14px' }}>
                Skip the physical lines. Check in online to join the digital queue and we will direct you to the ideal window as soon as a teller becomes available.
              </p>
            </div>

            {/* Benefit Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-secondary)', padding: '6px', background: 'var(--color-secondary-light)', borderRadius: '8px', display: 'flex' }}>
                  <HeartHandshake size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Homely Assistance</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Senior citizens and priority guests receive immediate, dedicated assistance.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-accent)', padding: '6px', background: 'var(--color-accent-light)', borderRadius: '8px', display: 'flex' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Secure Queue Routing</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Our smart routing engine maps you directly to specialists for foreign exchange, loans, or deposits.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-accent)', padding: '6px', background: 'var(--color-accent-light)', borderRadius: '8px', display: 'flex' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Real-time Queue Status</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Currently, {openCounters.length} teller windows are active and waiting to serve you.
                  </p>
                </div>
              </div>
            </div>

            {/* Service Counter Directory */}
            {openCounters.length > 0 && (
              <div className="glass-panel" style={{ padding: '20px', background: 'var(--card-bg)', marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={16} style={{ color: 'var(--color-secondary)' }} /> Station Function Directory
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {openCounters.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Station {c.windowNumber}</span>
                      <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{c.type || 'General Service'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Portal Check-In Form */}
          <div className="glass-panel" style={{ padding: '36px 30px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '12px',
                borderRadius: '50%',
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
                marginBottom: '12px'
              }}>
                <Ticket size={24} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Ghana Branch Check-In</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Enter your details to generate your bank queue ticket.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {error && (
                <div className="glass-panel" style={{
                  padding: '12px 16px',
                  borderColor: 'var(--color-danger)',
                  background: 'rgba(185, 28, 28, 0.05)',
                  color: 'var(--color-danger)',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Kofi Mensah"
                    className="glass-input"
                    style={{ paddingLeft: '44px', height: '46px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0244123456"
                    className="glass-input"
                    style={{ paddingLeft: '44px', height: '46px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Your Bank
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)', zIndex: 1 }} />
                    <select
                      name="bank"
                      value={formData.bank}
                      onChange={handleChange}
                      className="glass-input"
                      style={{ paddingLeft: '44px', height: '46px' }}
                    >
                      {GH_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Select Branch
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)', zIndex: 1 }} />
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="glass-input"
                      style={{ paddingLeft: '44px', height: '46px' }}
                    >
                      {(BRANCHES_MAP[formData.bank] || []).map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Purpose of Visit
                </label>
                <div style={{ position: 'relative' }}>
                  <Layers size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)', zIndex: 1 }} />
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="glass-input"
                    style={{ paddingLeft: '44px', height: '46px' }}
                  >
                    {VISIT_PURPOSES.map(purpose => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
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
                    accentColor: 'var(--color-secondary)'
                  }}
                />
                <label htmlFor="isVip" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  I require priority assistance (Senior Citizens / Expecting Mothers)
                </label>
              </div>

              <button type="submit" className="glass-button primary" style={{ width: '100%', height: '48px', borderRadius: '12px', marginTop: '6px', fontSize: '1rem' }}>
                Join the Queue <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (activeTicket.status === 'completed' && showFeedback) ? (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '24px 0' }}>
          <TellerReviewForm activeTicket={activeTicket} />
        </div>
      ) : (
        <div className="grid-2">
          {/* Left Column: Physical Style Ticket Card */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
            <div className="ticket-card animate-fade-in" style={{
              width: '100%',
              maxWidth: '380px'
            }}>
              {/* Ticket side cutouts */}
              <div className="ticket-cutout-left" />
              <div className="ticket-cutout-right" />
              <div style={{ textAlign: 'center', paddingBottom: '12px' }}>
                {activeTicket.status === 'checked_in' ? (
                  <span className={`badge ${activeTicket.isVip ? 'secondary' : 'primary'}`} style={{ marginBottom: '12px' }}>
                    {activeTicket.isVip ? '⭐ Priority Guest' : 'Standard Check-In'}
                  </span>
                ) : activeTicket.status === 'completed' ? (
                  <span className="badge success" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Served
                  </span>
                ) : (
                  <span className="badge warning animate-pulse-soft" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} style={{ color: 'var(--color-highlight)' }} /> Being Served
                  </span>
                )}
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  {activeTicket.bank}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeTicket.branch || 'Accra Main Branch'}</p>
                
                {/* Large Authentic Ticket Number */}
                <h2 style={{
                  fontSize: '3.75rem',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  color: 'var(--color-accent)',
                  margin: '16px 0',
                  lineHeight: '1',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {activeTicket.ticketNumber}
                </h2>
                
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{activeTicket.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Purpose: {activeTicket.purpose}</p>

                <div style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(32, 84, 70, 0.04)',
                  border: '1px dashed var(--color-accent)',
                  display: 'inline-block'
                }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>
                    Verification PIN
                  </span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-accent)', margin: '4px 0 0 0', letterSpacing: '3px' }}>
                    {activeTicket.verificationCode || '----'}
                  </h4>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                    Present this PIN to the teller to start service
                  </p>
                </div>
              </div>

              <div className="ticket-divider" />

              {/* Barcode details */}
              <Barcode />
              <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', letterSpacing: '2px' }}>
                *TKT-{activeTicket.ticketNumber}*
              </div>

              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginTop: '20px',
                borderTop: '1px solid rgba(32, 84, 70, 0.08)',
                paddingTop: '16px'
              }}>
                Issued: {activeTicket.checkInTime} • SmartFlow Ghana
              </div>
            </div>
          </div>

          {/* Right Column: Direction Card & Service Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '30px', background: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: 'var(--color-secondary)' }} /> Queue Tracking
              </h3>

              {activeTicket.status === 'checked_in' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(217, 119, 6, 0.06)',
                  border: '1px solid rgba(217, 119, 6, 0.15)',
                  color: 'var(--color-highlight)',
                  marginBottom: '20px'
                }}>
                  <Clock size={24} className="animate-pulse-soft" style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Awaiting Assignment</h4>
                    <p style={{ fontSize: '0.85rem', opacity: '0.85', marginTop: '4px', lineHeight: '1.4' }}>
                      We are routing you to the best available station for <strong>{activeTicket.purpose}</strong>. Please have a seat in our customer lounge.
                    </p>
                    {handlingStationsStr && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(217, 119, 6, 0.15)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <span style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designated Service Stations:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{handlingStationsStr}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTicket.status === 'completed' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(32, 84, 70, 0.06)',
                  border: '1px solid rgba(32, 84, 70, 0.15)',
                  color: 'var(--color-accent)',
                  marginBottom: '20px'
                }}>
                  <CheckCircle size={26} style={{ marginTop: '2px' }} />
                  <div style={{ width: '100%' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Transaction Completed!</h4>
                    <p style={{ fontSize: '0.85rem', opacity: '0.85', marginTop: '4px', lineHeight: '1.4' }}>
                      Thank you for banking with us. Your service at Station {activeTicket.assignedTellerWindow} is complete.
                    </p>
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="glass-button primary"
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Rate Station Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'var(--color-accent-light)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--color-accent)',
                  marginBottom: '20px'
                }}>
                  <CheckCircle size={26} style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Your Station is Ready!</h4>
                    <p style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', marginTop: '6px', color: 'var(--color-accent)' }}>
                      Proceed to Station: {counters.find(c => c.id === activeTicket.assignedCounterId || c.staffId === activeTicket.assignedCounterId)?.windowNumber || 'Assigned Counter'}
                    </p>
                    {(() => {
                      const assignedCounter = counters.find(c => c.id === activeTicket.assignedCounterId || c.staffId === activeTicket.assignedCounterId);
                      if (assignedCounter && assignedCounter.type) {
                        return (
                          <div style={{
                            marginTop: '8px',
                            paddingTop: '6px',
                            borderTop: '1px solid rgba(32, 84, 70, 0.15)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            Station Specialization: <strong>{assignedCounter.type}</strong>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              {/* Waiting Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: 'none' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Queue Position</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {position !== null && position > 0 ? `#${position}` : 'Awaiting'}
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', boxShadow: 'none' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Wait Time</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {position !== null && position > 0 ? `${position * 3}m` : '--'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px 24px', background: 'rgba(32, 84, 70, 0.02)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <MapPin size={14} /> Location: {activeTicket.branch} • Active Support Online
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TellerReviewForm({ activeTicket }) {
  const { submitTicketReview, clearActiveTicket } = useApp();
  const [rating, setRating] = useState(100);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRatingLabel = (val) => {
    if (val >= 90) return 'Excellent Service ⭐⭐⭐⭐⭐';
    if (val >= 70) return 'Good Service ⭐⭐⭐⭐';
    if (val >= 50) return 'Average Service ⭐⭐⭐';
    if (val >= 30) return 'Poor Service ⭐⭐';
    return 'Very Unsatisfied Service ⭐';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await submitTicketReview(activeTicket.id, rating, comment);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{
      width: '100%',
      maxWidth: '500px',
      padding: '36px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          padding: '16px',
          borderRadius: '50%',
          background: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          marginBottom: '16px'
        }}>
          <HeartHandshake size={36} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>Share Your Experience</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
          Thank you for banking with us! Please rate the service provided by <strong>Station {activeTicket.assignedTellerWindow || '--'}</strong>.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(185, 28, 28, 0.05)',
          border: '1px solid rgba(185, 28, 28, 0.15)',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Slider input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Satisfaction Rate</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-accent)' }}>{rating}%</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: 'var(--card-border)',
              accentColor: 'var(--color-accent)',
              cursor: 'pointer',
              outline: 'none'
            }}
          />

          <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>
            {getRatingLabel(rating)}
          </p>
        </div>

        {/* Comment block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Write a Comment (Optional)
            </label>
            <span style={{ fontSize: '0.75rem', color: comment.length >= 1000 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
              {comment.length} / 1000
            </span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            placeholder="Tell us what you liked or what we can improve..."
            maxLength={1000}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              background: 'var(--input-bg, transparent)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={clearActiveTicket}
            disabled={loading}
            className="glass-button"
            style={{ flex: 1, height: '46px', borderRadius: '12px' }}
          >
            Skip Feedback
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="glass-button primary"
            style={{ flex: 1, height: '46px', borderRadius: '12px' }}
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}
