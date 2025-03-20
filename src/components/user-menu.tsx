'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { type User } from '@supabase/supabase-js';
import Image from 'next/image';
import { CartButton } from './cart-button';

export function UserMenu({
  user,
  signOutAction,
  role,
}: {
  user: User | null;
  signOutAction: () => void;
  role: string | null;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
      >
        Login
      </Link>
    );
  }

  return (
    <>
      <CartButton />
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex cursor-pointer rounded-full bg-gray-800 text-sm transition focus:ring-4 focus:ring-gray-300 md:me-0 dark:focus:ring-gray-600"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="sr-only">Open user menu</span>
          <div className="relative h-10 w-10">
            <Image
              src={'/images/img-placeholder.webp'}
              alt="profile"
              fill
              className="rounded-full object-cover p-0.5"
            />
          </div>
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 z-50 mt-2 w-48 list-none divide-y divide-gray-100 rounded-lg bg-white text-base shadow-sm dark:divide-gray-600 dark:bg-gray-700">
            <div className="px-4 py-3">
              <span className="block text-sm text-gray-900 dark:text-white">
                {user.email?.split('@')[0] || 'User'}
              </span>
              <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                {user.email || ''}
              </span>
            </div>
            <ul className="py-2" aria-labelledby="user-menu-button">
              {role && role === 'admin' && (
                <li>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Cart
                </Link>
              </li>
              <li>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </form>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
