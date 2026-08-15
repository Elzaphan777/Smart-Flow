import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const API_BASE = 'https://smart-flow-9bny.onrender.com/api';
const SOCKET_BASE = 'https://smart-flow-9bny.onrender.com';

const PURPOSE_TO_SERVICE = {
  'Cash Deposits': 'deposits',
  'Cash Withdrawals': 'withdrawals',
  'Account Enquiries': 'general',
  'Mobile Money / Forex': 'foreign_exchange',
  'Loans & Credit Services': 'loans',
  'Card Issues / Password Reset': 'customer_service'
};

const SERVICE_TO_PURPOSE = {
  'deposits': 'Cash Deposits',
  'withdrawals': 'Cash Withdrawals',
  'general': 'Account Enquiries',
  'foreign_exchange': 'Mobile Money / Forex',
  'loans': 'Loans & Credit Services',
  'customer_service': 'Card Issues / Password Reset',
  'account_opening': 'Account Opening',
  'bulk_deposits': 'Bulk Deposits'
};

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('smartflow-theme') || 'light');
  
  // Authenticated User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartflow-user');
    return saved ? JSON.parse(saved) : null;
  });

  // Local Registered Users Registry (to persist created accounts with Staff IDs)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('smartflow-registered-users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smartflow-registered-users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // App Active Role (for demo switcher)
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('smartflow-role') || 'customer');

  // Customer State & CheckIns (tickets list)
  const [checkIns, setCheckIns] = useState([]);
  
  // Tellers/Counters State
  const [counters, setCounters] = useState([]);

  // System Stats
  const [stats, setStats] = useState({
    totalServed: 0,
    avgWaitTime: 0,
    satisfaction: 95
  });

  // Latest customer reviews
  const [latestReviews, setLatestReviews] = useState([]);

  // Live Alerts/Notifications
  const [notifications, setNotifications] = useState([
    { id: 'init-1', title: 'System Initialized', message: 'Smart Flow queue optimizer is online.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type: 'system', read: false }
  ]);

  // Active Ticket state (to remember the current user's ticket if they checked in on this browser)
  const [activeTicket, setActiveTicket] = useState(() => {
    const saved = localStorage.getItem('smartflow-activeticket');
    return saved ? JSON.parse(saved) : null;
  });

  // Tokens cache
  const [tokens, setTokens] = useState({});
  const socketRef = useRef(null);

  // Helper to log in a teller/manager in the background and return JWT token
  const getAuthToken = async (staffId) => {
    if (tokens[staffId]) return tokens[staffId];
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password: 'Teller@1234' })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setTokens(prev => ({ ...prev, [staffId]: data.token }));
        return data.token;
      }
    } catch (err) {
      console.error(`Auth failed for ${staffId}:`, err);
    }
    return null;
  };

  // Sync theme
  useEffect(() => {
    localStorage.setItem('smartflow-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync User Session
  useEffect(() => {
    localStorage.setItem('smartflow-user', JSON.stringify(user));
  }, [user]);

  // Sync role & trigger authentication when switching roles
  useEffect(() => {
    localStorage.setItem('smartflow-role', activeRole);
    // Background authentications to enable seamless API operations
    if (activeRole === 'manager') {
      getAuthToken('TLR001'); // Kwame Asante (Manager)
    } else if (activeRole === 'security') {
      getAuthToken('TLR005'); // Yaw Darko (Teller)
    }
  }, [activeRole]);

  // Sync active ticket
  useEffect(() => {
    localStorage.setItem('smartflow-activeticket', JSON.stringify(activeTicket));
  }, [activeTicket]);

  // Setup WebSocket connection and handle real-time events
  useEffect(() => {
    const socket = io(SOCKET_BASE);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      socket.emit('join_display');
      socket.emit('join_kiosk');
    });

    socket.on('ticket_assigned', (data) => {
      addNotification({
        title: 'Queue Assigned',
        message: `Ticket ${data.ticketNumber} directed to Station ${data.windowNumber}`,
        type: 'assignment'
      });
      
      // Update active ticket if it matches
      setActiveTicket(prev => {
        if (prev && prev.ticketNumber === data.ticketNumber) {
          return { ...prev, status: 'directed', assignedCounterId: `counter-${data.windowNumber}` };
        }
        return prev;
      });

      refreshQueueAndSnapshot();
    });

    socket.on('now_serving', (data) => {
      addNotification({
        title: 'Now Serving',
        message: `Ticket ${data.ticketNumber} is now being served at Station ${data.windowNumber}`,
        type: 'served'
      });

      setActiveTicket(prev => {
        if (prev && prev.ticketNumber === data.ticketNumber) {
          return { ...prev, status: 'serving', assignedCounterId: `counter-${data.windowNumber}` };
        }
        return prev;
      });

      refreshQueueAndSnapshot();
    });

    socket.on('ticket_waiting', (data) => {
      addNotification({
        title: 'Customer Entry',
        message: `New customer entry in queue. Ticket: ${data.ticketNumber} for ${SERVICE_TO_PURPOSE[data.serviceType] || data.serviceType}`,
        type: 'entry'
      });
      refreshQueueAndSnapshot();
    });

    socket.on('queue_update', (data) => {
      console.log('🔄 Queue update received:', data.type);
      refreshQueueAndSnapshot();
    });

    socket.on('teller_status_change', (data) => {
      if (data.isOnline && data.isAvailable) {
        addNotification({
          title: 'Station Online',
          message: `Station ${data.windowNumber} is now online and available.`,
          type: 'station_free'
        });
      }
      refreshQueueAndSnapshot();
    });

    socket.on('teller_signalled_freedom', (data) => {
      addNotification({
        title: 'Station Ready',
        message: `Station ${data.windowNumber} is free and ready to serve!`,
        type: 'station_free'
      });
      refreshQueueAndSnapshot();
    });

    socket.on('ticket_completed', (data) => {
      addNotification({
        title: 'Service Completed',
        message: `Ticket ${data.ticketNumber} transaction completed at Station ${data.windowNumber}.`,
        type: 'served'
      });
      setActiveTicket(prev => {
        if (prev && prev.ticketNumber === data.ticketNumber) {
          return { 
            ...prev, 
            status: 'completed', 
            assignedTellerWindow: data.windowNumber 
          };
        }
        return prev;
      });
      refreshQueueAndSnapshot();
    });

    return () => {
      socket.disconnect();
    };
  }, [activeRole, tokens]);

  // Helper to add local notification
  const addNotification = ({ title, message, type }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Re-fetch tickets queue and dashboard snapshot
  const refreshQueueAndSnapshot = async () => {
    try {
      // Fetch online tellers (public endpoint)
      const tellersRes = await fetch(`${API_BASE}/tellers/online`);
      const tellersData = await tellersRes.json();
      const onlineTellers = tellersData.success ? tellersData.data : [];

      // Fetch active tickets (requires manager/teller token)
      let activeTickets = [];
      const managerToken = await getAuthToken('TLR001');
      if (managerToken) {
        const queueRes = await fetch(`${API_BASE}/tickets/queue`, {
          headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        const queueData = await queueRes.json();
        if (queueData.success) {
          activeTickets = queueData.data;
        }
      }

      // If active role is manager, let's fetch all tellers (online and offline)
      let allTellers = onlineTellers;
      if (activeRole === 'manager' && managerToken) {
        const allTellersRes = await fetch(`${API_BASE}/tellers`, {
          headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        const allTellersData = await allTellersRes.json();
        if (allTellersData.success) {
          allTellers = allTellersData.data;
        }
      }

      // Map backend tickets to frontend format
      const mappedCheckIns = activeTickets.map(tick => ({
        id: tick._id,
        name: tick.clientInfo?.name || 'Walk-in Client',
        phone: tick.clientInfo?.phone || '',
        purpose: SERVICE_TO_PURPOSE[tick.serviceType] || tick.serviceType,
        bank: tick.clientInfo?.accountNumber || 'GCB Bank',
        isVip: tick.priority === 'priority',
        ticketNumber: tick.ticketNumber,
        status: tick.status === 'waiting' ? 'checked_in' : 'directed',
        checkInTime: new Date(tick.timing?.issuedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        assignedCounterId: tick.assignedTeller?._id || tick.assignedTeller,
        waitTime: 0
      }));
      setCheckIns(mappedCheckIns);

      // Map tellers and their assigned tickets to frontend counters format
      const mappedCounters = allTellers.map(t => {
        const tellerTickets = activeTickets
          .filter(tick => tick.assignedTeller && (tick.assignedTeller._id === t._id || tick.assignedTeller === t._id))
          .map(tick => ({
            id: tick._id,
            ticketNumber: tick.ticketNumber,
            name: tick.clientInfo?.name || 'Client',
            purpose: SERVICE_TO_PURPOSE[tick.serviceType] || tick.serviceType,
            status: tick.status === 'serving' ? 'serving' : 'waiting'
          }));

        return {
          id: t._id,
          name: `${t.name} (Window ${t.windowNumber})`,
          windowNumber: t.windowNumber,
          type: t.specializations.map(s => SERVICE_TO_PURPOSE[s] || s).join(', '),
          specializations: t.specializations,
          isOpen: t.isOnline,
          isAvailable: t.isAvailable,
          customers: tellerTickets,
          staffId: t.staffId
        };
      });
      
      // Sort counters by window number so they display in order
      mappedCounters.sort((a, b) => a.windowNumber - b.windowNumber);
      setCounters(mappedCounters);

      // Fetch stats from snapshot endpoint
      if (managerToken) {
        const snapRes = await fetch(`${API_BASE}/dashboard/snapshot`, {
          headers: { 'Authorization': `Bearer ${managerToken}` }
        });
        const snapData = await snapRes.json();
        if (snapData.success && snapData.data) {
          const statsData = snapData.data.ticketStats;
          const completedStats = statsData.find(s => s._id === 'completed') || { count: 0, avgServiceTime: 0 };
          const servingStats = statsData.find(s => s._id === 'serving') || { count: 0, avgWaitTime: 0 };
          const waitingStats = statsData.find(s => s._id === 'waiting') || { count: 0, avgWaitTime: 0 };

          const waitTimeMs = completedStats.avgWaitTime || servingStats.avgWaitTime || waitingStats.avgWaitTime || 0;
          const avgWaitTimeMinutes = waitTimeMs > 0 ? (waitTimeMs / 60000) : 6;

          // Real average satisfaction from backend reviews if available
          const dbAvg = snapData.data.avgSatisfaction;
          const satisfactionPercent = (dbAvg !== undefined && dbAvg !== null) ? dbAvg : Math.max(80, Math.min(99, Math.round(98 - avgWaitTimeMinutes * 1.5)));

          setStats({
            totalServed: completedStats.count || 0,
            avgWaitTime: avgWaitTimeMinutes,
            satisfaction: satisfactionPercent
          });

          if (snapData.data.latestReviews) {
            setLatestReviews(snapData.data.latestReviews);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
    }
  };

  // Initial load and polling
  useEffect(() => {
    refreshQueueAndSnapshot();
    const timer = setInterval(refreshQueueAndSnapshot, 5000);
    return () => clearInterval(timer);
  }, [activeRole, tokens]);

  // Sync active ticket status regularly if one exists
  useEffect(() => {
    if (!activeTicket) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/tickets/status/${activeTicket.ticketNumber}`);
        const data = await res.json();
        if (data.success && data.data) {
          const t = data.data;
          let localStatus = 'checked_in';
          if (t.status === 'completed') {
            localStatus = 'completed';
          } else if (t.status !== 'waiting') {
            localStatus = 'directed';
          }
          setActiveTicket({
            id: t._id,
            name: t.clientInfo?.name,
            phone: t.clientInfo?.phone,
            purpose: SERVICE_TO_PURPOSE[t.serviceType],
            bank: t.clientInfo?.accountNumber || 'GCB Bank',
            isVip: t.priority === 'priority',
            ticketNumber: t.ticketNumber,
            verificationCode: t.verificationCode,
            status: localStatus,
            checkInTime: new Date(t.timing?.issuedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            assignedCounterId: t.assignedTeller?._id || t.assignedTeller,
            assignedTellerName: t.assignedTeller?.name || '',
            assignedTellerWindow: t.assignedTeller?.windowNumber || '',
            waitTime: 0
          });
        }
      } catch (err) {
        console.error('Error checking active ticket status:', err);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [activeTicket?.ticketNumber]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 1. Customer Action: Submit a check-in
  const addCheckIn = async (customerData) => {
    try {
      const serviceType = PURPOSE_TO_SERVICE[customerData.purpose] || 'general';
      const body = {
        serviceType,
        priority: customerData.isVip ? 'priority' : 'normal',
        clientInfo: {
          name: customerData.name,
          phone: customerData.phone,
          bank: customerData.bank,
          branch: customerData.branch,
          accountNumber: (user && user.accountNumber) ? user.accountNumber : 'N/A'
        }
      };

      const res = await fetch(`${API_BASE}/tickets/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success && data.data) {
        const t = data.data;
        const newCustomer = {
          id: t.ticketNumber,
          name: customerData.name,
          phone: customerData.phone,
          purpose: customerData.purpose,
          bank: customerData.bank,
          branch: customerData.branch,
          accountNumber: (user && user.accountNumber) ? user.accountNumber : 'N/A',
          isVip: customerData.isVip || false,
          ticketNumber: t.ticketNumber,
          verificationCode: t.verificationCode,
          status: t.status === 'waiting' ? 'checked_in' : 'directed',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          assignedCounterId: t.assignedWindow ? `counter-${t.assignedWindow}` : null,
          waitTime: 0
        };

        setActiveTicket(newCustomer);
        refreshQueueAndSnapshot();
        return newCustomer;
      }
    } catch (err) {
      console.error('Failed to issue ticket:', err);
    }
    return null;
  };

  // 2. Security Action: Direct a customer to a counter
  const directCustomer = async (customerId, counterId) => {
    try {
      const ticket = checkIns.find(c => c.id === customerId || c.ticketNumber === customerId);
      if (!ticket) return;

      const securityToken = await getAuthToken('TLR005');
      if (!securityToken) return;

      const res = await fetch(`${API_BASE}/tickets/${ticket.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${securityToken}`
        },
        body: JSON.stringify({ toTellerId: counterId, reason: 'Security assignment' })
      });
      const data = await res.json();
      if (data.success) {
        refreshQueueAndSnapshot();
      }
    } catch (err) {
      console.error('Failed to route customer:', err);
    }
  };

  // 3. Manager/Teller Action: Serve / complete service
  const serveCustomer = async (counterId, customerId, verificationCode) => {
    try {
      const teller = counters.find(c => c.id === counterId);
      if (!teller) return;

      const tellerToken = await getAuthToken(teller.staffId);
      if (!tellerToken) return;

      const callRes = await fetch(`${API_BASE}/tickets/${customerId}/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tellerToken}` 
        },
        body: JSON.stringify({ verificationCode })
      });
      const callData = await callRes.json();

      if (callData.success) {
        // Complete service after a small timeout to show transition
        setTimeout(async () => {
          try {
            await fetch(`${API_BASE}/tickets/${customerId}/complete`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tellerToken}` 
              },
              body: JSON.stringify({ notes: 'Simulated service completion' })
            });
            refreshQueueAndSnapshot();
          } catch (e) {
            console.error('Failed to complete ticket:', e);
          }
        }, 1000);
      } else {
        alert(callData.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Failed to serve customer:', err);
    }
  };

  // 4. Manager Control: Toggle teller open/close
  const toggleCounterStatus = async (counterId) => {
    try {
      const teller = counters.find(c => c.id === counterId);
      if (!teller) return;

      const managerToken = await getAuthToken('TLR001');
      if (!managerToken) return;

      const newOnline = !teller.isOpen;

      const res = await fetch(`${API_BASE}/tellers/${counterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managerToken}`
        },
        body: JSON.stringify({ isOnline: newOnline, isAvailable: newOnline })
      });
      const data = await res.json();
      if (data.success) {
        refreshQueueAndSnapshot();
      }
    } catch (err) {
      console.error('Failed to toggle teller status:', err);
    }
  };

  // Helper: Clear alerts
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Helper: Reset simulator to defaults
  const resetSimulator = async () => {
    try {
      const managerToken = await getAuthToken('TLR001');
      if (!managerToken) return;

      const res = await fetch(`${API_BASE}/dashboard/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${managerToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveTicket(null);
        setNotifications([
          { id: 'reset-1', title: 'System Reset', message: 'All queues and check-ins have been reset.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type: 'system', read: false }
        ]);
        refreshQueueAndSnapshot();
      }
    } catch (err) {
      console.error('Failed to reset simulator:', err);
    }
  };

  // Authentication Helpers
  const loginUser = (emailOrStaffIdOrAccount, password) => {
    // Check locally registered accounts first (allows logging in with newly registered Staff IDs / Account Numbers)
    const customUser = registeredUsers.find(u => 
      (u.email && u.email.toLowerCase() === emailOrStaffIdOrAccount.toLowerCase()) ||
      (u.staffId && u.staffId.toLowerCase() === emailOrStaffIdOrAccount.toLowerCase()) ||
      (u.accountNumber && u.accountNumber.toLowerCase() === emailOrStaffIdOrAccount.toLowerCase())
    );

    let loggedInUser = null;

    if (customUser) {
      loggedInUser = {
        name: customUser.name,
        email: customUser.email,
        role: customUser.role,
        dob: customUser.dob,
        staffId: customUser.staffId,
        bank: customUser.bank,
        accountNumber: customUser.accountNumber
      };
    } else {
      // Fallback: match backend seeded tellers
      const teller = counters.find(c => c.staffId?.toLowerCase() === emailOrStaffIdOrAccount.toLowerCase() || (c.email && c.email.toLowerCase() === emailOrStaffIdOrAccount.toLowerCase()));
      
      if (teller) {
        loggedInUser = {
          name: teller.name,
          email: teller.email || `${teller.staffId.toLowerCase()}@smartflow.com`,
          role: teller.staffId === 'TLR001' ? 'manager' : 'security',
          dob: '1990-05-10',
          staffId: teller.staffId,
          bank: null,
          accountNumber: null
        };
      } else {
        loggedInUser = {
          name: emailOrStaffIdOrAccount.includes('@') ? emailOrStaffIdOrAccount.split('@')[0] : emailOrStaffIdOrAccount,
          email: emailOrStaffIdOrAccount.includes('@') ? emailOrStaffIdOrAccount : `${emailOrStaffIdOrAccount.toLowerCase()}@smartflow.com`,
          role: 'customer',
          dob: '1995-12-01',
          staffId: null,
          bank: null,
          accountNumber: emailOrStaffIdOrAccount // Fallback to raw string
        };
      }
    }

    setUser(loggedInUser);
    setActiveRole(loggedInUser.role);
    
    // Background authentications triggered dynamically by context listeners will load backend JWTs
    addNotification({
      title: 'Welcome Back',
      message: `${loggedInUser.name} logged in successfully.`,
      type: 'system'
    });
    return { success: true };
  };

  const registerUser = (userData) => {
    const newUser = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      dob: userData.dob,
      staffId: userData.staffId || null
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setActiveRole(userData.role);
    addNotification({
      title: 'Account Created',
      message: `Successfully registered profile for ${newUser.name}.`,
      type: 'system'
    });
    return { success: true };
  };

  // Teller specific action: Call ticket
  const callTicket = async (staffId, ticketId, verificationCode) => {
    try {
      const token = await getAuthToken(staffId);
      if (!token) return { success: false, message: 'Authentication failed for teller.' };

      const res = await fetch(`${API_BASE}/tickets/${ticketId}/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ verificationCode })
      });
      const data = await res.json();
      if (data.success) {
        refreshQueueAndSnapshot();
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Failed to call ticket.' };
    } catch (err) {
      console.error('Error calling ticket:', err);
      return { success: false, message: 'Network error calling ticket.' };
    }
  };

  // Teller specific action: Complete ticket
  const completeTicket = async (staffId, ticketId, notes) => {
    try {
      const token = await getAuthToken(staffId);
      if (!token) return { success: false, message: 'Authentication failed for teller.' };

      const res = await fetch(`${API_BASE}/tickets/${ticketId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (data.success) {
        refreshQueueAndSnapshot();
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Failed to complete ticket.' };
    } catch (err) {
      console.error('Error completing ticket:', err);
      return { success: false, message: 'Network error completing ticket.' };
    }
  };

  // Teller specific action: Toggle availability
  const toggleTellerAvailability = async (staffId, isAvailable) => {
    try {
      const token = await getAuthToken(staffId);
      if (!token) return { success: false, message: 'Authentication failed for teller.' };

      const res = await fetch(`${API_BASE}/tellers/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        refreshQueueAndSnapshot();
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Failed to toggle availability.' };
    } catch (err) {
      console.error('Error toggling availability:', err);
      return { success: false, message: 'Network error toggling availability.' };
    }
  };

  // Teller specific action: Approve and direct ticket to himself
  const approveAndDirectTicket = async (staffId, ticketId) => {
    try {
      const token = await getAuthToken(staffId);
      if (!token) return { success: false, message: 'Authentication failed for teller.' };

      // Find the teller object in counters to get their Mongo _id
      const tellerCounter = counters.find(c => c.staffId === staffId);
      if (!tellerCounter) return { success: false, message: 'Teller station profile not found.' };

      const res = await fetch(`${API_BASE}/tickets/${ticketId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toTellerId: tellerCounter.id, reason: 'Self-assignment' })
      });
      const data = await res.json();
      if (data.success) {
        refreshQueueAndSnapshot();
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || 'Failed to assign ticket.' };
    } catch (err) {
      console.error('Error in self-assignment:', err);
      return { success: false, message: 'Network error in self-assignment.' };
    }
  };

  // Customer Action: Submit a ticket review
  const submitTicketReview = async (ticketId, rating, comment) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (data.success) {
        setActiveTicket(null);
        refreshQueueAndSnapshot();
        return { success: true };
      }
      return { success: false, message: data.message || 'Failed to submit review.' };
    } catch (err) {
      console.error('Error submitting review:', err);
      return { success: false, message: 'Network error submitting review.' };
    }
  };

  const clearActiveTicket = () => {
    setActiveTicket(null);
  };

  // Teller specific action: Signal freedom to branch
  const signalTellerFreedom = async (staffId) => {
    try {
      const token = await getAuthToken(staffId);
      if (!token) return { success: false, message: 'Authentication failed for teller.' };

      const res = await fetch(`${API_BASE}/tellers/signal-freedom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, message: data.message || 'Failed to signal freedom.' };
    } catch (err) {
      console.error('Error signalling freedom:', err);
      return { success: false, message: 'Network error signalling freedom.' };
    }
  };

  const logoutUser = () => {
    setUser(null);
    setActiveTicket(null);
    addNotification({
      title: 'Session Ended',
      message: 'You have logged out of your session.',
      type: 'system'
    });
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      activeRole,
      setActiveRole,
      user,
      loginUser,
      registerUser,
      logoutUser,
      checkIns,
      counters,
      stats,
      notifications,
      activeTicket,
      addCheckIn,
      directCustomer,
      serveCustomer,
      toggleCounterStatus,
      clearNotifications,
      resetSimulator,
      callTicket,
      completeTicket,
      toggleTellerAvailability,
      approveAndDirectTicket,
      latestReviews,
      submitTicketReview,
      clearActiveTicket,
      signalTellerFreedom
    }}>
      {children}
    </AppContext.Provider>
  );
};
export default AppContext;
