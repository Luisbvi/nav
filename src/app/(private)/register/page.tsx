'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signUp } from '@/app/(private)/actions/auth';
import { useLanguage } from '@/contexts/language-context';
import LanguageSelector from '@/components/layout/language-selector';
import ToggleSwitch from '@/components/toggel-switch';
import { CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await signUp(formData);

    setIsLoading(false);

    if (result.status === 'success') {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setError(result.status || t('register_error'));
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
      className="flex min-h-screen bg-gray-100 dark:bg-gray-900"
      aria-labelledby="register-heading"
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
                {t('register_success') || 'Account created successfully! Redirecting to login...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        className="absolute top-4 right-4 z-10 flex items-center gap-4"
      >
        <LanguageSelector darkText />
        <ToggleSwitch />
      </motion.div>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col justify-center px-4 py-16 md:px-6 md:py-12"
        aria-labelledby="register-heading"
      >
        <header className="mx-auto w-full max-w-md">
          <Link href={'/'} aria-label="Home">
            <motion.div
              variants={itemVariants}
              className="relative h-32 w-auto overflow-hidden md:h-48"
            >
              <Image
                src="/images/logo-lg.png"
                alt="Company logo"
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo-w-lg.png"
                alt="Company logo"
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                className="hidden object-contain dark:block"
                priority
              />
            </motion.div>
          </Link>

          <motion.h1
            id="register-heading"
            variants={itemVariants}
            className="mt-6 text-center text-2xl font-extrabold text-gray-900 md:text-3xl dark:text-gray-100"
          >
            {t('register_your_vessel')}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            {t('already_registered')}{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
            >
              {t('sign_in')}
            </Link>
          </motion.p>
        </header>

        <motion.div variants={itemVariants} className="mx-auto mt-6 w-full max-w-md md:mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg bg-white px-4 py-6 shadow md:px-10 md:py-8 dark:bg-gray-800"
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="dark:bg-opacity-20 mb-4 border-l-4 border-red-500 bg-red-50 p-3 text-red-700 dark:bg-red-900 dark:text-red-300"
                  role="alert"
                >
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.h2
                  variants={itemVariants}
                  className="text-base font-medium text-gray-900 md:text-lg dark:text-gray-100"
                >
                  {t('captain_information')}
                </motion.h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <motion.div variants={itemVariants}>
                    <Label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t('first_name')}
                    </Label>
                    <Input
                      id="first-name"
                      name="first-name"
                      required
                      className="mt-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      aria-required="true"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Label
                      htmlFor="last-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t('last_name')}
                    </Label>
                    <Input
                      id="last-name"
                      name="last-name"
                      required
                      className="mt-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      aria-required="true"
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('email_address')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    aria-required="true"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('password')}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    aria-required="true"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label
                    htmlFor="preferred-language"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('preferred_language')}
                  </Label>
                  <motion.select
                    whileHover={{ scale: 1.02 }}
                    id="preferred-language"
                    name="preferred-language"
                    className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                    aria-required="true"
                  >
                    <option value="en">{t('language_english')}</option>
                    <option value="es">{t('language_spanish')}</option>
                    <option value="zh">{t('language_chinese')}</option>
                    <option value="fr">{t('language_french')}</option>
                  </motion.select>
                </motion.div>
              </motion.div>

              <Separator className="dark:bg-gray-600" />

              <motion.div variants={itemVariants} className="space-y-4">
                <motion.h2
                  variants={itemVariants}
                  className="text-base font-medium text-gray-900 md:text-lg dark:text-gray-100"
                >
                  {t('vessel_information')}
                </motion.h2>
                <motion.div variants={itemVariants}>
                  <Label
                    htmlFor="vessel-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('vessel_name')}
                  </Label>
                  <Input
                    id="vessel-name"
                    name="vessel-name"
                    required
                    className="mt-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    aria-required="true"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label
                    htmlFor="shipping-company"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('shipping_company_optional')}
                  </Label>
                  <Input
                    id="shipping-company"
                    name="shipping-company"
                    className="mt-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    aria-required="false"
                  />
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
                      <span className="ml-2" aria-live="polite">
                        {t('registering') || 'Registering...'}
                      </span>
                    </div>
                  ) : (
                    <span>{t('register')}</span>
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
