'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { LoginForm } from '@/components/auth/login-form';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
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
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Background with gold accent for Admin */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black"></div>

            <div className="relative z-10 w-full max-w-md space-y-4">
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
                        <ShieldCheck className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                    <p className="text-gray-400 text-sm">Restricted Access Only</p>
                </div>

                <LoginForm restrictedRole="admin" />
            </div>
        </div>
    );
}
