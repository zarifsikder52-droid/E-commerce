'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/use-auth';
import { useUIStore } from '@/store/use-ui';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const inputClass = (error?: string) =>
  `input-elegant w-full h-11 rounded-lg border bg-transparent px-4 pl-11 text-sm outline-none ${error ? 'border-red-500' : 'border-border/50'}`;

// ============================
// LoginPage
// ============================
export function LoginPage() {
  const { login } = useAuthStore();
  const { navigate } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password, rememberMe }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        toast.success('Login successful! Welcome back.');
        navigate('home');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Invalid email or password');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border/50 shadow-sm p-8">
        <div className="text-center pb-2 mb-6">
          <h1 className="text-2xl font-medium tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Sign in to your NextShop account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                className={inputClass(errors.email)}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                className={`${inputClass(errors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border h-4 w-4"
              />
              <span className="text-sm text-muted-foreground font-light">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate('forgot-password')}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Signing in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="border-t border-border/50" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-light">
              or continue with
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button type="button" className="w-full h-10 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="w-full h-10 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        <div className="justify-center pb-2 pt-6">
          <p className="text-sm text-muted-foreground text-center font-light">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate('register')}
              className="text-foreground hover:underline font-medium transition-colors"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================
// RegisterPage
// ============================
export function RegisterPage() {
  const { login } = useAuthStore();
  const { navigate } = useUIStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(?:\+880|01)\d{9,10}$/.test(phone.trim())) newErrors.phone = 'Enter a valid BD phone number';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name: fullName, email, phone, password }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        toast.success('Registration successful! Welcome to NextShop.');
        navigate('home');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Registration failed. Please try again.');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border/50 shadow-sm p-8">
        <div className="text-center pb-2 mb-6">
          <h1 className="text-2xl font-medium tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Join NextShop and start shopping</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="reg-name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors({ ...errors, fullName: undefined }); }}
                className={inputClass(errors.fullName)}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: undefined }); }}
                className={inputClass(errors.email)}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="reg-phone" className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="reg-phone"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: undefined }); }}
                className={inputClass(errors.phone)}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }); }}
                className={`${inputClass(errors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirm-password" className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: undefined }); }}
                className={`${inputClass(errors.confirmPassword)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => { setAgreeTerms(e.target.checked); setErrors({ ...errors, terms: undefined }); }}
              className="rounded border-border h-4 w-4 mt-0.5"
            />
            <label className="text-sm text-muted-foreground leading-relaxed cursor-pointer font-light">
              I agree to the{' '}
              <span className="text-foreground font-medium">Terms of Service</span> and{' '}
              <span className="text-foreground font-medium">Privacy Policy</span>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Social Register */}
        <div className="mt-6">
          <div className="relative">
            <div className="border-t border-border/50" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-light">
              or sign up with
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button type="button" className="w-full h-10 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="w-full h-10 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        <div className="justify-center pb-2 pt-6">
          <p className="text-sm text-muted-foreground text-center font-light">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="text-foreground hover:underline font-medium transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================
// ForgotPasswordPage
// ============================
export function ForgotPasswordPage() {
  const { navigate } = useUIStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email }),
      });
      if (res.ok) {
        setSent(true);
        toast.success('Reset link sent! Check your email.');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send reset link');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border/50 shadow-sm p-8">
        <div className="text-center pb-2 mb-6">
          <h1 className="text-2xl font-medium tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-[#5B7553]/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[#5B7553]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Check Your Email</h3>
              <p className="text-sm text-muted-foreground mt-1.5 font-light">
                We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                Please check your inbox and follow the instructions.
              </p>
            </div>
            <button
              onClick={() => navigate('login')}
              className="mt-2 border border-border hover:bg-accent h-11 px-5 rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground font-light">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={inputClass(error)}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-full text-sm font-medium transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}