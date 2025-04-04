'use client';

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

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
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col md:flex-row"
    >
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full flex-1 flex-col justify-center p-6 md:w-1/2 md:p-8 lg:w-1/3 lg:p-12"
        aria-labelledby="login-heading"
      >
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-8 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 transform"
              role="alert"
              aria-live="polite"
            >
              <div className="dark:bg-opacity-80 flex items-center rounded-lg bg-green-50 px-4 py-3 shadow-lg dark:bg-green-900">
                <CheckCircle
                  className="h-5 w-5 text-green-600 dark:text-green-300"
                  aria-hidden="true"
                />
                <span className="ml-2 text-sm font-medium text-green-800 dark:text-green-100">
                  {t('sign_in_success') || 'Logged in successfully! Redirecting...'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-4 right-4 flex items-center gap-4"
        >
          <LanguageSelector darkText />
          <ToggleSwitch />
        </motion.div>

        <header className="mx-auto w-full max-w-md">
          <Link href="/" aria-label="Home">
            <motion.div variants={itemVariants} className="relative mx-auto h-48 w-auto">
              <Image
                src="/images/logo-lg.png"
                alt="Logo"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo-w-lg.png"
                alt="Logo"
                fill
                className="hidden object-contain dark:block"
                priority
              />
            </motion.div>
          </Link>

          <motion.h1
            id="login-heading"
            variants={itemVariants}
            className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100"
          >
            {t('sign_in_to_account') || 'Sign in to your account'}
          </motion.h1>
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
        </header>

        <motion.div variants={itemVariants} className="mx-auto mt-8 w-full max-w-md">
          <motion.div
            variants={itemVariants}
            className="rounded-lg bg-white px-10 py-8 shadow dark:bg-gray-800"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="dark:bg-opacity-20 mb-4 border-l-4 border-red-500 bg-red-50 p-3 text-red-700 dark:bg-red-900 dark:text-red-300"
                role="alert"
              >
                <p>{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('email_address') || 'Email address'}
                </label>
                <div className="relative mt-1">
                  <Mail
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('email_placeholder') || 'captain@example.com'}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 shadow-sm focus:border-blue-600 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
                  <Lock
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 shadow-sm focus:border-blue-600 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Aquí está la modificación principal para el responsive */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-500"
                    aria-describedby="remember-me-description"
                  />
                  <label
                    htmlFor="remember-me"
                    id="remember-me-description"
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
                        aria-hidden="true"
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
      </motion.section>
    </motion.main>
  );
}
