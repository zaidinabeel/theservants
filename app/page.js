'use client';

/**
 * ============================================
 * THE SERVANTS - MAIN PAGE
 * ============================================
 * Router component that shows either:
 * - Public Website (default)
 * - Admin Panel (when #admin in URL)
 */

import { useEffect, useState } from 'react';
import PublicWebsite from '@/components/PublicWebsite';
import AdminPanel from '@/components/AdminPanel';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if URL contains #admin
    const checkAdmin = () => {
      setIsAdmin(window.location.hash === '#admin');
    };

    checkAdmin();
    window.addEventListener('hashchange', checkAdmin);
    
    return () => window.removeEventListener('hashchange', checkAdmin);
  }, []);

  return isAdmin ? <AdminPanel /> : <PublicWebsite />;
}
