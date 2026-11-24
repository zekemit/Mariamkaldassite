import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './admin.css';

// The editor is private: never indexed, never cached, no public chrome (the (site) group supplies that).
export const metadata: Metadata = {
  title: 'Site editor',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
