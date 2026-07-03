import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Lock, Calendar, Shield, Eye, EyeOff, Check, X, AlertTriangle, Building, CreditCard } from 'lucide-react';

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
  const { loginUser, registerUser, activeRole } = useApp();
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
      // Login validation based on selection method
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
        // Account Number verification
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

      // Login flow
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

      // Password regulation checks
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
    <div className="auth-view animate-fade-in" style={{
      width: '100%',
      maxWidth: '440px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        padding: '30px 24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Toggle tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--card-border)',
          marginBottom: '24px',
          gap: '16px'
        }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderBottom: isLogin ? '2px solid var(--color-accent)' : '2px solid transparent',
              paddingBottom: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderBottom: !isLogin ? '2px solid var(--color-accent)' : '2px solid transparent',
              paddingBottom: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Login Method Pills Selector */}
        {isLogin && (
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '20px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => { setLoginMethod('accountNumber'); setError(''); }}
              style={{
                flex: 1,
                border: 'none',
                background: loginMethod === 'accountNumber' ? 'var(--color-accent)' : 'none',
                color: loginMethod === 'accountNumber' ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Account No.
            </button>
            {formData.role !== 'customer' && (
              <button
                type="button"
                onClick={() => { setLoginMethod('staffId'); setError(''); }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: loginMethod === 'staffId' ? 'var(--color-accent)' : 'none',
                  color: loginMethod === 'staffId' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Staff ID
              </button>
            )}
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setError(''); }}
              style={{
                flex: 1,
                border: 'none',
                background: loginMethod === 'email' ? 'var(--color-accent)' : 'none',
                color: loginMethod === 'email' ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Email
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isLogin ? 'Enter your details to manage your queues' : 'Register a profile with secure controls'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div className="glass-panel" style={{
              padding: '12px',
              borderColor: 'var(--color-danger)',
              background: 'rgba(225, 29, 72, 0.05)',
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
              background: 'rgba(22, 163, 74, 0.05)',
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

          {/* Full Name (Sign Up only) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Kofi Mensah"
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          {/* Email Address / Staff ID / Account Number Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              {!isLogin 
                ? 'Email Address' 
                : (loginMethod === 'email' 
                    ? 'Email Address' 
                    : (loginMethod === 'staffId' ? 'Staff ID' : 'Account Number'))}
            </label>
            <div style={{ position: 'relative' }}>
              {!isLogin || loginMethod === 'email' ? (
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
              ) : loginMethod === 'staffId' ? (
                <Shield size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
              ) : (
                <CreditCard size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
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
                style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Date of Birth (Sign Up only) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Date of Birth
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          )}

          {/* Role selector (Sign Up only) */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Role Profile
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="customer">Customer</option>
                  <option value="manager">Admin</option>
                  <option value="security">Security</option>
                </select>
              </div>
            </div>
          )}

          {/* Staff ID Field (Sign Up only for manager/security) */}
          {!isLogin && (formData.role === 'manager' || formData.role === 'security') && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Staff ID
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId || ''}
                  onChange={handleChange}
                  placeholder="e.g. TLR006"
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          {/* Bank Selector (Sign Up only for customer) */}
          {!isLogin && formData.role === 'customer' && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Your Bank
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
                <select
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem', appearance: 'none', cursor: 'pointer' }}
                >
                  {GH_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Account Number Row (Sign Up only for customer) */}
          {!isLogin && formData.role === 'customer' && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Account Number
              </label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g. 102498762193"
                  className="glass-input"
                  style={{ paddingLeft: '40px', paddingRight: '14px', height: '44px', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="glass-input"
                style={{ paddingLeft: '40px', paddingRight: '44px', height: '44px', fontSize: '0.9rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength Checklist (Sign Up only) */}
          {!isLogin && formData.password.length > 0 && (
            <div className="glass-panel" style={{
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <p style={{ fontWeight: '700', marginBottom: '2px', color: 'var(--text-secondary)' }}>
                Password Regulations:
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.length ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                {pwValidations.length ? <Check size={12} /> : <X size={12} />}
                <span>At least 8 characters long</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.uppercase ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                {pwValidations.uppercase ? <Check size={12} /> : <X size={12} />}
                <span>At least 1 uppercase letter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.lowercase ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                {pwValidations.lowercase ? <Check size={12} /> : <X size={12} />}
                <span>At least 1 lowercase letter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.number ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                {pwValidations.number ? <Check size={12} /> : <X size={12} />}
                <span>At least 1 digit (0-9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: pwValidations.specialChar ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                {pwValidations.specialChar ? <Check size={12} /> : <X size={12} />}
                <span>At least 1 special character</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="glass-button primary"
            style={{ width: '100%', height: '44px', borderRadius: '12px', marginTop: '10px' }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {isLogin && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginTop: '20px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.01)',
            padding: '8px',
            borderRadius: '8px',
            border: '1px dashed var(--card-border)'
          }}>
            🔑 <strong>Demo Access IDs:</strong><br />
            Manager: <code>TLR001</code> | Security: <code>TLR005</code><br />
            Password for all accounts: <code>Teller@1234</code>
          </div>
        )}
      </div>
    </div>
  );
}
