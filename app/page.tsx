'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage directly
    const stored = localStorage.getItem('user');
    let redirectPath = '/login';

    if (stored) {
      try {
        const user = JSON.parse(stored);
        redirectPath = user.role === 'admin' ? '/admin' : '/member';
      } catch (e) {
        redirectPath = '/login';
      }
    }

    router.replace(redirectPath);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-4xl font-bold gold-text mb-2">Nagarbhavi Brigades</div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
