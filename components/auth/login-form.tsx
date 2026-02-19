'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api'; // Added this import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface LoginFormProps {
  restrictedRole?: 'admin' | 'member';
}

export function LoginForm({ restrictedRole }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Pre-check credentials and role WITHOUT setting global auth state yet
      const preCheckUser = await api.login(email, password);

      // 2. Enforce Role Restriction
      // If role doesn't match, treat it as Invalid Credentials (security best practice)
      if (restrictedRole) {
        if (restrictedRole === 'admin' && preCheckUser.role !== 'admin') {
          // Admin portal, but user is not admin
          throw new Error('Invalid credentials');
        }
        if (restrictedRole === 'member' && preCheckUser.role === 'admin') {
          // Member portal, but user is admin
          throw new Error('Invalid credentials');
        }
      }

      // 3. If valid, NOW call the context login to set state and localStorage
      // (This effectively calls the API a second time, but ensures state consistency with the provider)
      const user = await login(email, password);

      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/member');
      }
    } catch (err: any) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gold-text">Nagarbhavi Brigades</h1>
          <p className="text-muted-foreground">Premium Business Networking Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-10 pr-10" // Added pr-10 for the eye icon
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground border-t border-white/10 pt-4 space-y-2">
          {/* Registration disabled as per request */}
          <p className="text-xs">© 2026 Nagarbhavi Brigades. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

