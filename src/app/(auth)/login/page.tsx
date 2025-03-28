'use client';

import type React from 'react';
import { useState } from 'react';
import { CheckCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from '../actions/auth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { AnimatePresence, motion } from 'framer-motion';
import LanguageSelector from '@/components/layout/language-selector';
import ToggleSwitch from '@/components/toggel-switch';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signIn(formData);

    setIsLoading(false);

    if (result.status === 'success') {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/home');
      }, 1500);
    } else {
      setError(result.status || t('sign_in_error') || 'An error occurred during sign in');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen"
    >
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-8 left-1/2 z-50 -translate-x-1/2 transform"
          >
            <div className="dark:bg-opacity-80 flex items-center rounded-lg bg-green-50 px-4 py-3 shadow-lg dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
              <span className="ml-2 text-sm font-medium text-green-800 dark:text-green-100">
                {t('sign_in_success') || 'Logged in successfully! Redirecting...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-[-240px] flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: -20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.7,
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="absolute top-4 right-4 flex items-center gap-4"
        >
          <LanguageSelector darkText />
          <ToggleSwitch />
        </motion.div>

        <motion.div variants={itemVariants} className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href={'/'}>
            <motion.div className="relative h-48 w-auto overflow-hidden">
              <Image
                src="/images/logo-lg.png"
                alt="logo"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/images/logo-w-lg.png"
                alt="logo"
                fill
                className="hidden object-contain dark:block"
              />
            </motion.div>
          </Link>

          <motion.h2
            variants={itemVariants}
            className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100"
          >
            {t('sign_in_to_account') || 'Sign in to your account'}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            {t('or') || 'Or'}{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
            >
              {t('register_new_account') || 'register a new vessel account'}
            </Link>
          </motion.p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            variants={itemVariants}
            className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dark:bg-opacity-20 mb-4 border-l-4 border-red-500 bg-red-50 p-3 text-red-700 dark:bg-red-900 dark:text-red-300"
              >
                <p>{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('email_address') || 'Email address'}
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('email_placeholder') || 'captain@example.com'}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 shadow-sm focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('password') || 'Password'}
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 shadow-sm focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={togglePasswordVisibility}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('remember_me') || 'Remember me'}
                  </label>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm"
                >
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                  >
                    {t('forgot_password') || 'Forgot your password?'}
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: 'linear',
                        }}
                        className="h-4 w-4"
                      >
                        <svg
                          className="h-4 w-4 text-white"
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
                      </motion.div>
                      <span className="ml-2">{t('signing_in') || 'Signing in...'}</span>
                    </div>
                  ) : (
                    t('sign_in') || 'Sign in'
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
