// src/context/AdminAuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApiService from '../api/adminApiService';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAdmin();
  }, []);

  const loadStoredAdmin = async () => {
    try {
      const [token, user] = await Promise.all([
        adminApiService.getStoredAdminToken(),
        adminApiService.getStoredAdminUser(),
      ]);
      if (token && user) {
        setAdmin(user);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const adminLogin = async (username, password) => {
    const res = await adminApiService.adminLogin(username, password);
    if (res?.success) setAdmin(res.data.admin);
    return res;
  };

  const adminLogout = async () => {
    await adminApiService.adminLogout();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      admin, loading,
      isAdminAuthenticated: !!admin,
      adminLogin, adminLogout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
};
