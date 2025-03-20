'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md p-2 hover:bg-blue-600 ${
        isActive ? 'bg-white text-[#0099ff]' : ''
      }`}
    >
      {children}
    </Link>
  );
};
