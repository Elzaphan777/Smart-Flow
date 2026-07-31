import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Calendar, Shield, Eye, EyeOff, Check, X, AlertTriangle, Building, CreditCard, Landmark, CheckCircle } from 'lucide-react';

const GH_BANKS = [
  'GCB Bank',
  'Ecobank Ghana',
  'Stanbic Bank',
  'Absa Bank Ghana',
  'Fidelity Bank Ghana',
  'CalBank',
  'Zenith Bank Ghana'
];

export default function AuthView() {
  const { loginUser, registerUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('accountNumber'); // 'accountNumber' | 'staffId' | 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    role: 'customer',
    staffId: '',
    bank: GH_BANKS[0],
    accountNumber: ''
  });

  // Fallback loginMethod if selected registration role changes to customer
  useEffect(() => {
    if (formData.role === 'customer' && loginMethod === 'staffId') {
      setLoginMethod('accountNumber');
    }
  }, [formData.role, loginMethod]);

  // Password regulations state
  const [pwValidations, setPwValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });

  // Check password strength in real-time
  useEffect(() => {
    const pwd = formData.password;
    setPwValidations({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      specialChar: /[^A-Za-z0-9]/.test(pwd)
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate age (must be 18+)
  const validateAge = (dobString) => {
    if (!dobString) return false;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      // Login validation
      if (loginMethod === 'email') {
        if (!formData.email.trim()) {
          setError('Email address is required.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address.');
          return;
        }
      } else if (loginMethod === 'staffId') {
        if (!formData.email.trim()) {
          setError('Staff ID is required.');
          return;
        }
        if (formData.email.trim().length < 3) {
          setError('Staff ID must be at least 3 characters long.');
          return;
        }
      } else {
        // Account Number
        if (!formData.email.trim()) {
          setError('Account Number is required.');
          return;
        }
        if (formData.email.trim().length < 6) {
          setError('Account Number must be at least 6 digits long.');
          return;
        }
      }

      if (!formData.password) {
        setError('Password is required.');
        return;
      }

      const res = loginUser(formData.email, formData.password);
      if (res.success) {
        setSuccess('Logged in successfully!');
      } else {
        setError(res.message || 'Login failed.');
      }
    } else {
      // Registration validation
      if (!formData.name.trim()) {
        setError('Full Name is required.');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email address is required.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!formData.dob) {
        setError('Date of Birth is required.');
        return;
      }
      if (!validateAge(formData.dob)) {
        setError('Age Requirement Error: You must be at least 18 years old to register.');
        return;
      }
      if (formData.role === 'customer') {
        if (!formData.accountNumber.trim()) {
          setError('Account Number is required.');
          return;
        }
        if (formData.accountNumber.trim().length < 6) {
          setError('Please enter a valid account number (minimum 6 digits).');
          return;
        }
      }
      if ((formData.role === 'manager' || formData.role === 'security') && !formData.staffId?.trim()) {
        setError('Staff ID is required for administrative roles.');
        return;
      }
      if (!formData.password) {
        setError('Password is required.');
        return;
      }

      const allPwRequirementsMet = Object.values(pwValidations).every(val => val === true);
      if (!allPwRequirementsMet) {
        setError('Password does not meet the safety regulations.');
        return;
      }

      const res = registerUser(formData);
      if (res.success) {
        setSuccess('Registration successful! Redirecting...');
      } else {
        setError(res.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="auth-view animate-fade-in" style={{ width: '100%' }}>
      <div className="grid-2">
        {/* Left Column: Trust and Welcoming Banner */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '24px',
          gap: '24px'
        }}>
          <div>
            <span className="badge secondary" style={{ marginBottom: '12px' }}>SmartFlow Security</span>
            <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2', color: 'var(--color-accent)', fontWeight: '700' }}>
              Your time is highly valued.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '14px' }}>
              SmartFlow matches you to the best service teller based on your account specializations and live branch loads. Sign in or register to join queues or manage branch operations.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Secure and private checking-in</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Intelligent queue routing diagnostics</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Automatic teller availability routing</span>
            </div>
          </div>

          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginTop: '20px',
            background: 'var(--color-secondary-light)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px dashed rgba(200, 93, 68, 0.2)'
          }}>
            🔑 <strong>Demo Access IDs (Sign In):</strong><br />
            Branch Manager (Admin View): Staff ID <code>TLR001</code><br />
            Security Officer (Security View): Staff ID <code>TLR005</code><br />
            Password for all accounts: <code>Teller@1234</code>
          </div>
        </div>

        {/* Right Column: Portal Sign In / Sign Up Forms */}
        <div className="glass-panel" style={{ padding: '36px 30px', background: 'var(--card-bg)' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--card-border)',
            marginBottom: '24px',
            gap: '16px'
          }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                borderBottom: isLogin ? '3px solid var(--color-accent)' : '3px solid transparent',
                paddingBottom: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                borderBottom: !isLogin ? '3px solid var(--color-accent)' : '3px solid transparent',
                paddingBottom: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Login Mode Pills */}
          {isLogin && (
            <div style={{
              display: 'flex',
              background: 'rgba(32, 84, 70, 0.04)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '24px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => { setLoginMethod('accountNumber'); setError(''); }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: loginMethod === 'accountNumber' ? 'var(--color-accent)' : 'none',
                  color: loginMethod === 'accountNumber' ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Account No.
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('staffId'); setError(''); }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: loginMethod === 'staffId' ? 'var(--color-accent)' : 'none',
                  color: loginMethod === 'staffId' ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Staff ID
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: loginMethod === 'email' ? 'var(--color-accent)' : 'none',
                  color: loginMethod === 'email' ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Email
              </button>
            </div>
          )}

          <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', color: 'var(--text-primary)', textAlign: 'center' }}>
            {isLogin ? 'Sign in to SmartFlow' : 'Create an Account'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center' }}>
            {isLogin ? 'Enter credentials to access your dashboard' : 'Join as a Customer, Security Officer, or Branch Manager'}
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div className="glass-panel" style={{
                padding: '12px',
                borderColor: 'var(--color-danger)',
                background: 'rgba(185, 28, 28, 0.05)',
                color: 'var(--color-danger)',
                fontSize: '0.8rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="glass-panel" style={{
                padding: '12px',
                borderColor: 'var(--color-success)',
                background: 'rgba(21, 128, 61, 0.05)',
                color: 'var(--color-success)',
                fontSize: '0.8rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            {/* Registration Full Name */}
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Kofi Mensah"
                    className="glass-input"
                    style={{ paddingLeft: '40px', height: '42px' }}
                  />
                </div>
              </div>
            )}

            {/* Email Address / Staff ID / Account Number Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                {!isLogin 
                  ? 'Email Address' 
                  : (loginMethod === 'email' 
                      ? 'Email Address' 
                      : (loginMethod === 'staffId' ? 'Staff ID' : 'Account Number'))}
              </label>
              <div style={{ position: 'relative' }}>
                {!isLogin || loginMethod === 'email' ? (
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                ) : loginMethod === 'staffId' ? (
                  <Shield size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                ) : (
                  <CreditCard size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                )}
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    !isLogin 
                      ? "yourname@domain.com" 
                      : (loginMethod === 'email' 
                          ? "e.g. kofi@smartflow.com" 
                          : (loginMethod === 'staffId' ? "e.g. TLR001" : "e.g. 102498762193"))
                  }
                  className="glass-input"
                  style={{ paddingLeft: '40px', height: '42px' }}
                />
              </div>
            </div>

            {/* Registration Date of Birth */}
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Date of Birth
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="glass-input"
                    style={{ paddingLeft: '40px', height: '42px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            )}

            {/* Registration Role Selector */}
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Account Role / Access Level
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)', zIndex: 1 }} />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="glass-input"
                    style={{ paddingLeft: '40px', height: '42px' }}
                  >
                    <option value="customer">Customer (Join branch queues)</option>
                    <option value="security">Security Officer (Router panel)</option>
                    <option value="manager">Branch Operations Manager (Admin)</option>
                  </select>
                </div>

                {/* Helpful friendly info text depending on role chosen */}
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  background: 'rgba(32, 84, 70, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--color-accent)'
                }}>
                  {formData.role === 'customer' && "👥 Customer: Check in online to GCB, Ecobank, Absa, CalBank, and print queue tickets."}
                  {formData.role === 'security' && "🛡️ Security: Direct incoming arrivals to tellers and maintain smooth lobby operations."}
                  {formData.role === 'manager' && "💼 Admin: Manage teller windows, open/close counters, and analyze performance statistics."}
                </div>
              </div>
            )}

            {/* Administrative Staff ID (Registration only) */}
            {!isLogin && (formData.role === 'manager' || formData.role === 'security') && (
              <div className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Staff ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    name="staffId"
                    value={formData.staffId || ''}
                    onChange={handleChange}
                    placeholder="e.g. TLR006"
                    className="glass-input"
                    style={{ paddingLeft: '40px', height: '42px' }}
                  />
                </div>
              </div>
            )}

            {/* Customer Specific Fields (Registration only) */}
            {!isLogin && formData.role === 'customer' && (
              <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Your Bank
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)', zIndex: 1 }} />
                    <select
                      name="bank"
                      value={formData.bank}
                      onChange={handleChange}
                      className="glass-input"
                      style={{ paddingLeft: '40px', height: '42px' }}
                    >
                      {GH_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Account Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber || ''}
                      onChange={handleChange}
                      placeholder="e.g. 102498762193"
                      className="glass-input"
                      style={{ paddingLeft: '40px', height: '42px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '44px', height: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '11px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength Checklist */}
            {!isLogin && formData.password.length > 0 && (
              <div className="glass-panel" style={{
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                boxShadow: 'none'
              }}>
                <p style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Password strength requirements:
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.length ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {pwValidations.length ? <Check size={12} /> : <X size={12} />}
                  <span>Minimum 8 characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.uppercase ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {pwValidations.uppercase ? <Check size={12} /> : <X size={12} />}
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.lowercase ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {pwValidations.lowercase ? <Check size={12} /> : <X size={12} />}
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.number ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {pwValidations.number ? <Check size={12} /> : <X size={12} />}
                  <span>Digit (0-9)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.specialChar ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {pwValidations.specialChar ? <Check size={12} /> : <X size={12} />}
                  <span>Special character (@, $, !, etc.)</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="glass-button primary"
              style={{ width: '100%', height: '46px', borderRadius: '12px', marginTop: '8px', fontSize: '0.95rem' }}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
