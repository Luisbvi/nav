import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import SearchInput from '@/components/dashboard/search';
import { NavLink } from '@/components/dashboard/nav-link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#0099ff] text-white">
        <Link href="/" className="w-60">
          <div className="relative h-32">
            <Image src="/images/logo-w-lg.png" alt="logo" fill className="object-contain" />
          </div>
        </Link>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink href="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink href="/dashboard/products">Products</NavLink>
            </li>
            <li>
              <NavLink href="/dashboard/orders">Orders</NavLink>
            </li>
            <li>
              <NavLink href="/dashboard/customers">Customers</NavLink>
            </li>
            <li>
              <NavLink href="/dashboard/settings">Settings</NavLink>
            </li>
          </ul>
          <div className="mt-8 border-t border-blue-400 pt-4">
            <Link href="/" className="flex items-center gap-3 rounded-md p-2 hover:bg-blue-600">
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="flex items-center justify-between bg-white p-4 shadow">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <SearchInput />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
