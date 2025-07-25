'use client';

import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { signOut } from '@/app/(private)/actions/auth';
import ToggleSwitch from '@/components/toggel-switch';
import { handleMenuItemClick } from '@/lib/utils';
import { User } from '@/types';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useLanguage, type Language } from '@/contexts/language-context';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const CompactLanguageSelector = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '/images/flag/usa.svg' },
    { code: 'es', name: 'Español', flag: '/images/flag/spain.svg' },
    { code: 'fr', name: 'Français', flag: '/images/flag/france.svg' },
  ];

  const selectedLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = async (lang: LanguageOption) => {
    await setLanguage(lang.code);
    setOpen(false);
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    closed: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full p-1 focus:outline-none"
        aria-expanded={open}
        aria-haspopup="true"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative h-6 w-6 overflow-hidden rounded-full border border-gray-200 dark:border-gray-600">
          <Image
            src={selectedLanguage.flag}
            alt={`${selectedLanguage.name} flag`}
            fill
            className="object-cover"
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <motion.ul
              initial="closed"
              animate="open"
              variants={{
                open: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
                closed: {
                  transition: { staggerChildren: 0.02, staggerDirection: -1 },
                },
              }}
              className="py-1"
            >
              {languages.map((lang) => (
                <motion.li key={lang.code} variants={itemVariants}>
                  <button
                    onClick={() => selectLanguage(lang)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
                      selectedLanguage.code === lang.code
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="relative h-4 w-4 overflow-hidden rounded-full">
                      <Image src={lang.flag} alt="" fill className="object-cover" />
                    </div>
                    <span className="truncate">{lang.name}</span>
                    {selectedLanguage.code === lang.code && (
                      <Check className="ml-auto h-4 w-4 text-blue-500" />
                    )}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HamburguerButton = ({ user }: { user: User | null }) => {
  const [active, setActive] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { itemCount } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        active
      ) {
        setActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [active]);

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <MotionConfig transition={{ duration: 0.5, ease: 'easeInOut' }}>
      <motion.button
        ref={buttonRef}
        initial={false}
        onClick={() => setActive((prev) => !prev)}
        className="relative h-20 w-20 rounded-full bg-white/0 transition-colors hover:bg-white/20 md:hidden"
        animate={active ? 'open' : 'close'}
        aria-expanded={active}
        aria-haspopup="true"
        aria-label="Main menu"
      >
        <motion.span
          style={{ top: '35%', left: '50%', x: '-50%', y: '-50%' }}
          className="absolute h-1 w-10 bg-white"
          variants={{
            open: { rotate: ['0deg', '0deg', '45deg'], top: ['35%', '50%', '50%'] },
            close: { rotate: ['45deg', '0deg', '0deg'], top: ['50%', '50%', '35%'] },
          }}
        />
        <motion.span
          style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
          className="absolute h-1 w-10 bg-white"
          variants={{
            open: { rotate: ['0deg', '0deg', '-45deg'] },
            close: { rotate: ['-45deg', '0deg', '0deg'] },
          }}
        />
        <motion.span
          style={{ bottom: '35%', left: 'calc(50% + 10px)', x: '-50%', y: '50%' }}
          className="absolute h-1 w-5 bg-white"
          variants={{
            open: {
              rotate: ['0deg', '0deg', '-45deg'],
              left: '50%',
              bottom: ['35%', '50%', '50%'],
            },
            close: {
              rotate: ['-45deg', '0deg', '0deg'],
              left: 'calc(50% + 10px)',
              bottom: ['50%', '50%', '35%'],
            },
          }}
        />
      </motion.button>

      <AnimatePresence>
        {active && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-24 right-0 left-0 z-50 block w-full items-center justify-between drop-shadow-lg md:hidden"
            id="navbar-user"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="mx-4 mt-4 flex flex-col rounded-lg border border-gray-100 bg-white p-2 font-medium shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {/* User info section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  {user ? (
                    <div>
                      <span className="block text-sm text-gray-900 dark:text-white">
                        {user?.vessel_name}
                      </span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </span>
                    </div>
                  ) : (
                    <span className="block text-sm text-gray-900 dark:text-white">Menu</span>
                  )}
                  <ToggleSwitch />
                </div>

                {/* Language selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
                  <CompactLanguageSelector />
                </div>
              </motion.div>

              {/* Admin Dashboard Section */}
              {user && user.role === 'admin' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="border-b border-gray-100 py-2 dark:border-gray-600"
                >
                  <Link
                    href="/dashboard"
                    onClick={() => handleMenuItemClick(setActive)}
                    className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                </motion.div>
              )}

              <motion.ul
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
                  },
                  closed: {
                    transition: { staggerChildren: 0.05, staggerDirection: -1 },
                  },
                }}
                className="py-2"
              >
                {user && (
                  <motion.li variants={itemVariants}>
                    <Link
                      href="/account"
                      onClick={() => handleMenuItemClick(setActive)}
                      className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                    >
                      Account
                    </Link>
                  </motion.li>
                )}

                <motion.li variants={itemVariants}>
                  <Link
                    href="/cart"
                    onClick={() => handleMenuItemClick(setActive)}
                    className="flex items-center justify-between rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                    role="menuitem"
                  >
                    Cart
                    {itemCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </motion.li>

                {!user ? (
                  <>
                    <motion.li variants={itemVariants}>
                      <Link
                        href="/login"
                        onClick={() => handleMenuItemClick(setActive)}
                        className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Login
                      </Link>
                    </motion.li>
                    <motion.li variants={itemVariants}>
                      <Link
                        href="/register"
                        onClick={() => handleMenuItemClick(setActive)}
                        className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Register
                      </Link>
                    </motion.li>
                  </>
                ) : (
                  <>
                    <motion.li variants={itemVariants}>
                      <Link
                        href="/orders"
                        onClick={() => handleMenuItemClick(setActive)}
                        className="block rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                        role="menuitem"
                      >
                        Orders
                      </Link>
                    </motion.li>

                    <motion.li variants={itemVariants}>
                      <form action={signOut} onSubmit={handleSignOut}>
                        <button
                          disabled={isLoggingOut}
                          type="submit"
                          className="mt-2 block w-full cursor-pointer rounded border-t border-gray-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:border-gray-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                          onClick={() => handleMenuItemClick(setActive)}
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
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Signing out...
                            </div>
                          ) : (
                            'Logout'
                          )}
                        </button>
                      </form>
                    </motion.li>
                  </>
                )}
              </motion.ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default HamburguerButton;
