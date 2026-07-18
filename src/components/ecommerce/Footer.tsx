'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/use-ui';
import { useSiteSettings } from '@/store/use-site-settings';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const { navigate } = useUIStore();
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { label: 'Home', view: 'home' as const },
    { label: 'Shop', view: 'shop' as const },
    { label: 'About', view: 'home' as const },
    { label: 'Contact', view: 'home' as const },
    { label: 'FAQ', view: 'home' as const },
  ];

  const customerLinks = [
    { label: 'My Account', view: 'dashboard' as const },
    { label: 'Order Tracking', view: 'orders' as const },
    { label: 'Wishlist', view: 'wishlist' as const },
    { label: 'Returns & Refunds', view: 'home' as const },
    { label: 'Privacy Policy', view: 'home' as const },
  ];

  return (
    <footer className="mt-auto bg-muted/20 border-t border-border/50 pb-16">
      <div className="container mx-auto px-5 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Logo & Tagline + Social */}
          <div className="space-y-6">
            <button onClick={() => navigate('home')} className="inline-block">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.storeName} className="h-7 object-contain" />
              ) : (
                <span className="text-lg font-medium tracking-tight text-foreground">
                  {settings.storeName}
                </span>
              )}
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs font-light">
              {settings.tagline}
            </p>
            <div className="flex items-center gap-5">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Youtube, label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors duration-200"
                >
                  <Icon className="size-[18px]" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.view)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Newsletter
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Updates on new arrivals and exclusive offers. No spam, ever.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email for newsletter"
                className="input-elegant flex-1 h-10 px-4 text-sm bg-background border border-border/50 rounded-full placeholder:text-muted-foreground/40 font-light"
              />
              <button
                type="submit"
                className="h-10 px-5 text-[13px] font-medium bg-foreground text-background rounded-full hover:bg-foreground/90 transition-all duration-300 shrink-0"
              >
                {subscribed ? 'Done' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-5 lg:px-10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/60 font-light">
              &copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground/50 font-light tracking-wide uppercase">
              <span>Visa</span>
              <span className="text-border/50">·</span>
              <span>Mastercard</span>
              <span className="text-border/50">·</span>
              <span>bKash</span>
              <span className="text-border/50">·</span>
              <span>Nagad</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}