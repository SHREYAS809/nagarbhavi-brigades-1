'use client';

import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
            <div className="relative z-10 w-full">
                <RegisterForm />
            </div>
        </div>
    );
}
