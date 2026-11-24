'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Item {
  label: string;
  href: string;
}

export function MobileNav({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes or Escape is pressed. (Hash links on the same page close via onClick.)
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="mobile-menu"
        style={{ position: 'absolute', left: 0, right: 0, top: '100%' }}
      >
        <nav aria-label="Mobile">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
