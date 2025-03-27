'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-auto border-t border-gray-200 bg-blue-600 px-4 py-8 md:px-6 lg:px-8 dark:border-gray-800 dark:bg-blue-500"
    >
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center"
        >
          <Link href="/" className="relative h-20 w-40">
            <Image
              src="/images/logo-w-lg.png"
              alt={t('logo_alt') || 'Company logo'}
              fill
              className="object-contain"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h3 className="text-base font-medium text-gray-200">
            {t('rights_reserved') || 'All rights reserved'}
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            {t('developed_by') || 'Developed by MassivoCreativo'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="#"
            className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-all"
          >
            {t('report_issue') || 'Report an issue'}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </motion.footer>
  );
}
