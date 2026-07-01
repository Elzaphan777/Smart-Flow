import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Initial Queue Configuration
const INITIAL_COUNTERS = [
  { id: 'counter-1', name: 'Teller 1', type: 'Deposits & Withdrawals', isOpen: true, customers: [] },
  { id: 'counter-2', name: 'Teller 2', type: 'Deposits & Withdrawals', isOpen: true, customers: [] },
  { id: 'counter-3', name: 'Teller 3', type: 'Enquiries & Accounts', isOpen: true, customers: [] },
  { id: 'counter-4', name: 'Customer Service', type: 'Loans & Cards', isOpen: true, customers: [] }
];

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('smartflow-theme') || 'light');
  
  // App Active Role (for demo switcher)
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('smartflow-role') || 'customer');

  // Customer State
  const [checkIns, setCheckIns] = useState(() => {
    const saved = localStorage.getItem('smartflow-checkins');
    return saved ? JSON.parse(saved) : [];
  });

  // Tellers/Counters State
  const [counters, setCounters] = useState(() => {
    const saved = localStorage.getItem('smartflow-counters');
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });

  // System Stats
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('smartflow-stats');
    return saved ? JSON.parse(saved) : {
      totalServed: 18,
      avgWaitTime: 6, // in minutes
      satisfaction: 94 // percentage
    };
  });

  // Live Alerts/Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('smartflow-notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'init-1', title: 'System Initialized', message: 'Smart Flow queue optimizer is online.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type: 'system', read: false }
    ];
  });

  // Active Ticket state (to remember the current user's ticket if they checked in on this browser)
  const [activeTicket, setActiveTicket] = useState(() => {
    const saved = localStorage.getItem('smartflow-activeticket');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync to localStorage whenever states change (enables cross-tab synced simulation!)
  useEffect(() => {
    localStorage.setItem('smartflow-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('smartflow-role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('smartflow-checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('smartflow-counters', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('smartflow-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('smartflow-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('smartflow-activeticket', JSON.stringify(activeTicket));
  }, [activeTicket]);

  // Sync state between tabs automatically using storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'smartflow-checkins') setCheckIns(JSON.parse(e.newValue || '[]'));
      if (e.key === 'smartflow-counters') setCounters(JSON.parse(e.newValue || '[]'));
      if (e.key === 'smartflow-notifications') setNotifications(JSON.parse(e.newValue || '[]'));
      if (e.key === 'smartflow-stats') setStats(JSON.parse(e.newValue || '{}'));
      if (e.key === 'smartflow-activeticket') setActiveTicket(JSON.parse(e.newValue || 'null'));
      if (e.key === 'smartflow-theme') setTheme(e.newValue || 'light');
      if (e.key === 'smartflow-role') setActiveRole(e.newValue || 'customer');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 1. Customer Action: Submit a check-in
  const addCheckIn = (customerData) => {
    const ticketPrefix = customerData.purpose === 'Loans & Cards' ? 'LN' : 
                         customerData.purpose === 'Enquiries & Accounts' ? 'EN' : 'TX';
    const ticketNumber = `${ticketPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: customerData.name,
      phone: customerData.phone,
      purpose: customerData.purpose,
      bank: customerData.bank,
      isVip: customerData.isVip || false,
      ticketNumber,
      status: 'checked_in', // checked_in -> directed -> serving -> served
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedCounterId: null,
      waitTime: 0
    };

    setCheckIns(prev => [newCustomer, ...prev]);
    setActiveTicket(newCustomer);

    // Create notification for Security & Manager
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `${newCustomer.isVip ? '⭐ VIP ' : ''}Customer Entry`,
      message: `${newCustomer.name} (${newCustomer.bank}) checked in for ${newCustomer.purpose}. Ticket: ${ticketNumber}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: newCustomer.isVip ? 'vip' : 'entry',
      read: false,
      customerId: newCustomer.id
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newCustomer;
  };

  // 2. Security Action: Direct a customer to a counter
  const directCustomer = (customerId, counterId) => {
    let directedCustomer = null;

    setCheckIns(prev => prev.map(cust => {
      if (cust.id === customerId) {
        directedCustomer = { ...cust, status: 'directed', assignedCounterId: counterId };
        return directedCustomer;
      }
      return cust;
    }));

    setCounters(prev => prev.map(counter => {
      if (counter.id === counterId) {
        return {
          ...counter,
          customers: [...counter.customers, { id: customerId, ticketNumber: directedCustomer?.ticketNumber, name: directedCustomer?.name, purpose: directedCustomer?.purpose, status: 'waiting' }]
        };
      }
      return counter;
    }));

    // If the active user checks in on this tab, update their ticket state
    if (activeTicket && activeTicket.id === customerId) {
      setActiveTicket(prev => ({ ...prev, status: 'directed', assignedCounterId: counterId }));
    }

    // Add logs/notifications
    const selectedCounter = counters.find(c => c.id === counterId);
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `Queue Assigned`,
      message: `${directedCustomer?.name || 'Customer'} directed to ${selectedCounter?.name || 'Counter'}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'assignment',
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // 3. Manager/Teller Action: Call next customer / complete service
  const serveCustomer = (counterId, customerId) => {
    setCounters(prev => prev.map(counter => {
      if (counter.id === counterId) {
        return {
          ...counter,
          customers: counter.customers.filter(c => c.id !== customerId)
        };
      }
      return counter;
    }));

    setCheckIns(prev => prev.map(cust => {
      if (cust.id === customerId) {
        return { ...cust, status: 'served' };
      }
      return cust;
    }));

    if (activeTicket && activeTicket.id === customerId) {
      setActiveTicket(null); // Clear local active ticket if served
    }

    // Update stats
    setStats(prev => ({
      ...prev,
      totalServed: prev.totalServed + 1,
      // Randomly tweak wait time and satisfaction for visual movement
      avgWaitTime: Math.max(3, Math.min(15, prev.avgWaitTime + (Math.random() > 0.5 ? 0.2 : -0.2))),
      satisfaction: Math.max(85, Math.min(100, prev.satisfaction + (Math.random() > 0.6 ? 1 : -1)))
    }));

    // Alert manager
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `Customer Served`,
      message: `Ticket served successfully at Counter. Total: ${stats.totalServed + 1}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'served',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // 4. Manager Control: Toggle teller open/close
  const toggleCounterStatus = (counterId) => {
    setCounters(prev => prev.map(counter => {
      if (counter.id === counterId) {
        return { ...counter, isOpen: !counter.isOpen };
      }
      return counter;
    }));
  };

  // Helper: Clear alerts
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Helper: Reset simulator to defaults
  const resetSimulator = () => {
    setCheckIns([]);
    setCounters(INITIAL_COUNTERS);
    setActiveTicket(null);
    setNotifications([
      { id: 'reset-1', title: 'System Reset', message: 'All queues and check-ins have been reset.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type: 'system', read: false }
    ]);
    setStats({
      totalServed: 18,
      avgWaitTime: 6,
      satisfaction: 94
    });
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      activeRole,
      setActiveRole,
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
      resetSimulator
    }}>
      {children}
    </AppContext.Provider>
  );
};
export default AppContext;
