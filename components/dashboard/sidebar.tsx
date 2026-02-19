'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Gift,
  Calendar,
  TrendingUp,
  User,
  LogOut,
  Share2,
  Send,
  Menu,
  X,
  Video,
  Wallet,
  CheckCircle,
  Bell,
  CheckSquare,
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isMember = user?.role === 'member';
  const isAdmin = user?.role === 'admin';

  const memberLinks = [
    { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/member/submit', label: 'Give Referral', icon: Send },
    { href: '/member/thank-you', label: 'Thank You Slip', icon: CheckCircle }, // TYFCB
    { href: '/member/referral', label: 'Referrals Given', icon: Gift },
    { href: '/member/referrals-received', label: 'Referrals Received', icon: CheckSquare },
    { href: '/member/meetings', label: 'Meetings', icon: Calendar },
    { href: '/member/broadcast', label: 'Broadcasts', icon: Bell },
    { href: '/member/revenue', label: 'Revenue', icon: TrendingUp },
    { href: '/member/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/referrals', label: 'Referrals', icon: Gift },
    { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
    { href: '/admin/meetings', label: 'Meetings', icon: Calendar },
    { href: '/admin/broadcast', label: 'Broadcast', icon: Send },
  ];

  const links = isMember ? memberLinks : adminLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-xl font-bold gold-text">Nagarbhavi</h1>
          <p className="text-xs text-muted-foreground">Brigades</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="px-6 py-6 border-t border-white/10 space-y-4">
        <div className="text-sm">
          <p className="text-muted-foreground text-xs">Logged in as</p>
          <p className="font-semibold text-foreground truncate">{user?.email}</p>
          <p className="text-xs text-primary capitalize">{user?.role}</p>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/5 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold gold-text">Nagarbhavi</h1>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm">
          <aside className="w-64 h-full bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
