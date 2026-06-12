import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../api/authApi';

export const AuthContext = createContext();

// Helper: pause execution for `ms` milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh current user profile
  const refreshUser = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser();
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * On initial mount, attempt to restore session with retries.
   * This handles Render free-tier cold starts where the backend
   * may take 20-30s to wake up. Without retries, the first
   * /auth/me call fails and the user is silently logged out
   * even though their HttpOnly cookie is still valid.
   */
  const initSessionWithRetry = async (maxAttempts = 3, delayMs = 2000) => {
    setLoading(true);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await getCurrentUser();
        if (res && res.data && res.data.user) {
          setUser(res.data.user);
          setLoading(false);
          return;
        }
        // API responded but no user — not a cold-start issue, stop retrying
        setUser(null);
        setLoading(false);
        return;
      } catch (error) {
        const isNetworkError = !error.response;
        const is401 = error.response?.status === 401;

        // 401 = cookie missing/invalid — don't retry, user is genuinely not logged in
        if (is401) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Network error on last attempt — give up
        if (isNetworkError && attempt === maxAttempts) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Network error — backend may be cold-starting, wait and retry
        if (isNetworkError && attempt < maxAttempts) {
          await sleep(delayMs);
        } else {
          // Any other error — stop immediately
          setUser(null);
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
  };

  // Run initialization check on load — retries on network errors to handle Render cold starts
  useEffect(() => {
    initSessionWithRetry();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      throw new Error(res.message || 'Login failed');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, phone) => {
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password, role, phone });
      if (res && res.data && res.data.user) {
        // Since register doesn't automatically log the user in via cookie in this design,
        // we can either return or attempt an automatic login. Let's return the user.
        return res.data.user;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
