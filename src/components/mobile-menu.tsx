'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { type User } from '@supabase/supabase-js';
import { CartButton } from './cart-button';

export function MobileMenu({
  user,
  signOutAction,
}: {
  user: User | null;
  signOutAction: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:outline-none md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        aria-controls="navbar-user"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="sr-only">Open main menu</span>
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile menu */}
      <div
        className={`w-full items-center justify-between md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-16 right-0 left-0 z-50`}
        id="navbar-user"
      >
        <ul className="mx-4 mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium dark:border-gray-700 dark:bg-gray-800">
          {user ? (
            <>
              <li>
                <CartButton />
              </li>
              <li>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="block w-full rounded-sm px-3 py-2 text-left text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign out
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/login"
                className="block rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
