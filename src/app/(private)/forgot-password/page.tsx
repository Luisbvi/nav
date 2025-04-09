'use client';

import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { forgotPassword } from '../actions/auth';
import { useLanguage } from '@/contexts/language-context';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '@/components/layout/language-selector';
import ToggleSwitch from '@/components/toggel-switch';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);

    const result = await forgotPassword(formData);

    setIsLoading(false);

    if (result.status === 'success') {
      setIsSubmitted(true);
    } else {
      setError(
        result.status || t('forgot_password_error') || 'An error occurred. Please try again.'
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

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen w-full"
    >
      {/* Language and Theme Controls */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 z-10 flex items-center gap-4"
      >
        <LanguageSelector darkText />
        <ToggleSwitch />
      </motion.header>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:py-12"
      >
        <motion.div variants={itemVariants} className="w-full max-w-md">
          <Link href="/" aria-label="Go to homepage">
            <motion.div className="relative h-32 w-auto overflow-hidden md:h-48">
              <Image
                src="/images/logo-lg.png"
                alt="Company logo"
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                priority
                className="object-contain dark:hidden"
              />
              <Image
                src="/images/logo-w-lg.png"
                alt="Company logo"
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                priority
                className="hidden object-contain dark:block"
              />
            </motion.div>
          </Link>

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-center text-2xl font-extrabold text-gray-900 md:text-3xl dark:text-gray-100"
          >
            {isSubmitted
              ? t('forgot_password_check_email') || 'Check your email'
              : t('forgot_password_title') || 'Recover your password'}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            {isSubmitted
              ? t('forgot_password_email_sent') ||
                "We've sent a recovery link to your email address"
              : t('forgot_password_description') ||
                "Enter your email address and we'll send you a link to reset your password"}
          </motion.p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 w-full max-w-md">
          <motion.div
            layout
            className="rounded-lg bg-white px-4 py-6 shadow md:px-10 md:py-8 dark:bg-gray-800"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success-message"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
                    aria-hidden="true"
                  >
                    <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 text-sm text-gray-500 dark:text-gray-400"
                  >
                    {t('forgot_password_email_instructions', {
                      email,
                    }) || (
                      <>
                        If an account exists with <strong>{email}</strong>, you will receive an
                        email with instructions to reset your password.
                      </>
                    )}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6"
                  >
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-sm font-medium text-[#0099ff] hover:text-[#0088ee] dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>{t('back_to_login') || 'Back to login'}</span>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-l-4 border-red-500 bg-red-50 p-4 dark:border-red-400 dark:bg-red-900/20"
                        role="alert"
                      >
                        <div className="flex">
                          <div className="flex-shrink-0" aria-hidden="true">
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
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 shadow-sm focus:border-[#0099ff] focus:ring-[#0099ff] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder={t('email_placeholder') || 'captain@example.com'}
                        aria-describedby={error ? 'email-error' : undefined}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-500"
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
                          <span className="ml-2" aria-live="polite">
                            {t('sending') || 'Sending...'}
                          </span>
                        </div>
                      ) : (
                        t('send_recovery_link') || 'Send Recovery Link'
                      )}
                    </motion.button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-[#0099ff] hover:text-[#0088ee] dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t('back_to_login') || 'Back to login'}
                    </Link>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.main>
  );
}
