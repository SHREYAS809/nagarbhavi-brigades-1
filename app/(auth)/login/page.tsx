'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const { isAuthenticated, user, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // wait until hydration finishes
    if (!isHydrated) return;

    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/member');
      }
    }
  }, [isAuthenticated, user, isHydrated, router]);

  // prevent flicker during hydration
  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <div className="relative z-10">
        <LoginForm restrictedRole="member" />
      </div>
    </div>
  );
}