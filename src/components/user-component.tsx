'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { signOut } from '@/app/(private)/actions/auth';
import { useCart } from '@/contexts/cart-context';
import { useLanguage } from '@/contexts/language-context';
import ToggleSwitch from '@/components/toggel-switch';
import { User } from '@/types';

const UserComponent = ({ user, role }: { user: User; role: string }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { itemCount } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    closed: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <MotionConfig transition={{ duration: 0.4, ease: 'easeInOut' }}>
      <div className="relative hidden md:block">
        <motion.button
          ref={buttonRef}
          onClick={() => setOpen((prev) => !prev)}
          className="flex cursor-pointer items-center gap-2 rounded-full text-white focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t('user_menu') || 'User menu'}
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-100 dark:border-gray-700">
            <Image
              src={user?.avatar_url || '/images/user-placeholder.png'}
              alt={t('profile_picture') || 'Profile picture'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="rounded-full object-cover"
            />
          </div>

          <span className="text-sm font-medium">{user?.vessel_name}</span>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-24 right-0 z-50 w-64 rounded-lg border border-gray-100 bg-white font-medium shadow-lg dark:border-gray-700 dark:bg-gray-800"
              role="menu"
              aria-orientation="vertical"
            >
              {/* User info */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-600">
                <div>
                  <span className="block text-sm text-gray-900 dark:text-white">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </span>
                </div>
                <ToggleSwitch />
              </div>

              {/* Dashboard */}
              {role && role === 'admin' && (
                <div className="border-b border-gray-100 py-2 dark:border-gray-600">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {t('dashboard') || 'Dashboard'}
                  </Link>
                </div>
              )}

              <motion.ul
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.07,
                      delayChildren: 0.2,
                    },
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.05,
                      staggerDirection: -1,
                    },
                  },
                }}
                className="py-2"
              >
                <motion.li variants={itemVariants}>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >
                    {t('cart') || 'Cart'}
                    {itemCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </motion.li>

                <motion.li variants={itemVariants}>
                  <Link
                    href="/orders"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >
                    {t('orders') || 'Orders'}
                  </Link>
                </motion.li>

                <motion.li variants={itemVariants}>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >
                    {t('profile') || 'Profile'}
                  </Link>
                </motion.li>

                <motion.li variants={itemVariants}>
                  <form action={signOut} onSubmit={handleSignOut}>
                    <button
                      disabled={isLoggingOut}
                      type="submit"
                      className="mt-2 block w-full cursor-pointer rounded border-t border-gray-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                      onClick={() => setOpen(false)}
                      role="menuitem"
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 animate-spin text-red-600 dark:text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t('signing_out') || 'Signing out...'}
                        </div>
                      ) : (
                        t('logout') || 'Logout'
                      )}
                    </button>
                  </form>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default UserComponent;
