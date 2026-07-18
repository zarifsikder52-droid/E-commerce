'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/store/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, EyeOff, Mail, Lock, Loader2, ArrowRight,
  Store, AlertTriangle, LogOut, LayoutDashboard,
  ShoppingCart, Users, Package, Tag, MessageSquare, Settings
} from 'lucide-react';
import AdminDashboard from '@/components/ecommerce/AdminDashboard';

// ============================
// Admin Login Page
// ============================
function AdminLoginPage() {
  const { login, isLoading, setLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      login(data.admin);
      toast.success(`Welcome back, ${data.admin.name}!`);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-4 shadow-lg shadow-emerald-500/25">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Sign in to NextShop dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardContent className="p-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@nextshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Demo credentials */}
            <div className="rounded-lg bg-muted/50 border border-border/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Demo Credentials
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Email: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">admin@nextshop.com</code></p>
                <p>Password: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">admin123</code></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to store link */}
        <div className="text-center mt-6">
          <a
            href="/"
            onClick={() => { sessionStorage.setItem('nextshop-admin-changed', 'true'); }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Store className="h-4 w-4" />
            Back to Store
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ============================
// Admin Panel Wrapper (with sidebar + header)
// ============================
function AdminPanelWrapper() {
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">NextShop Admin</span>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <nav className="hidden md:flex items-center gap-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <LayoutDashboard className="w-3 h-3" />
              Dashboard
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground leading-none">{admin?.name}</p>
              <p className="text-xs text-muted-foreground">{admin?.email}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <a
            href="/"
            onClick={() => { sessionStorage.setItem('nextshop-admin-changed', 'true'); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Visit Store"
          >
            <Store className="w-4 h-4" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="p-4 lg:p-6">
        <AdminDashboard />
      </main>
    </div>
  );
}

// ============================
// Admin Page (Login Guard)
// ============================
export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AdminPanelWrapper />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AdminLoginPage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}