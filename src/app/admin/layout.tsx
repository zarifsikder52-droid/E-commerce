import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NextShop Admin Panel',
  description: 'Admin dashboard for managing NextShop e-commerce store',
  icons: {
    icon: 'https://z-cdn.chatglm.cn/z-ai/static/logo.svg',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}