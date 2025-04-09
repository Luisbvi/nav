'use client';

import { useState, Suspense } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../actions/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/contexts/language-context';
import LanguageSelector from '@/components/layout/language-selector';
import ToggleSwitch from '@/components/toggel-switch';

function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData, code as string);

    setIsLoading(false);

    if (result.status === 'success') {
      setIsSubmitted(true);
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setError(
        result.status || t('reset_password_error') || 'An error occurred. Please try again.'
      );
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

  if (!code && !isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              {t('invalid_reset_link') || 'Invalid Link'}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('invalid_reset_link_description') ||
                'The password reset link is invalid or has expired.'}
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/forgot-password"
              className="inline-block w-full rounded-md border border-transparent bg-[#0099ff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0088ee] dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {t('request_new_link') || 'Request a new link'}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex">
      {/* Language and Theme Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 flex items-center gap-4"
      >
        <LanguageSelector darkText />
        <ToggleSwitch />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8"
      >
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
            {isSubmitted
              ? t('password_updated') || 'Password Updated!'
              : t('set_new_password') || 'Set your new password'}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            {isSubmitted
              ? t('password_updated_success') || 'Your password has been successfully updated'
              : t('create_secure_password') || 'Create a new secure password for your account'}
          </motion.p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div
            layout
            className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>

                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  {t('password_updated_redirect') ||
                    'Your password has been successfully updated. You will be redirected to the login page in a few seconds.'}
                </p>

                <div className="mt-6">
                  <Link
                    href="/login"
                    className="inline-block w-full rounded-md border border-transparent bg-[#0099ff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0088ee] dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {t('go_to_login') || 'Go to login'}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
                onSubmit={handleSubmit}
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-l-4 border-red-500 bg-red-50 p-4 dark:border-red-400 dark:bg-red-900/20"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-500 dark:text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('new_password') || 'New password'}
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 py-2 pr-10 pl-10 shadow-sm focus:border-[#0099ff] focus:ring-[#0099ff] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('password_min_length') || 'Must be at least 8 characters'}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('confirm_password') || 'Confirm password'}
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 py-2 pr-10 pl-10 shadow-sm focus:border-[#0099ff] focus:ring-[#0099ff] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-[#0099ff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0088ee] focus:ring-2 focus:ring-[#0099ff] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
                  >
                    {isLoading
                      ? t('updating_password') || 'Updating password...'
                      : t('update_password') || 'Update password'}
                  </button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-lg dark:text-gray-200">Loading...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
