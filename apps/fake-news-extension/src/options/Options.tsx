
import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { Loader2 } from 'lucide-react';

const Options = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['adminLoggedIn'], (result) => {
      setIsLoggedIn(result.adminLoggedIn || false);
      setLoading(false);
    });
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    chrome.storage.local.set({ adminLoggedIn: true });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    chrome.storage.local.remove('adminLoggedIn');
  };

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))] flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-[hsl(var(--card))]/90 dark:bg-[hsl(var(--card))]/90 border border-[hsl(var(--border))] dark:border-[hsl(var(--border))] rounded-xl shadow-lg p-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-6 text-[hsl(var(--primary-text))] dark:text-[hsl(var(--primary-text))]">VeriNews Extension Settings</h1>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-[hsl(var(--primary))] animate-spin mb-4" aria-label="Loading..." />
            <span className="text-lg font-semibold text-[hsl(var(--primary-text))] dark:text-[hsl(var(--primary-text))]">Loading...</span>
          </div>
        ) : (
          <div className="w-full animate-fade-in">
            {!isLoggedIn ? (
              <div aria-label="Admin Login Section">
                <AdminLogin onLogin={handleLogin} />
              </div>
            ) : (
              <div aria-label="Admin Dashboard Section">
                <AdminDashboard onLogout={handleLogout} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Options;
