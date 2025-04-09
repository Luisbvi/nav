'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Mail, Phone, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function Footer() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mt-auto border-t border-gray-200 bg-blue-600 px-6 py-12 md:px-8 lg:px-10 dark:border-gray-800 dark:bg-blue-500"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-6 lg:gap-12"
        >
          {/* Logo and Company Info */}
          <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start">
            <Link href="/" className="relative h-24 w-48 transition-transform hover:scale-105">
              <Image
                src="/images/logo-w-lg.png"
                alt={t('logo_alt') || 'Company logo'}
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </Link>
            <p className="mt-4 max-w-xs text-center text-sm text-gray-200 md:text-left">
              {t('company_description') ||
                'Providing exceptional logistics services across the globe with reliability and efficiency.'}
            </p>

            <motion.div variants={itemVariants} className="mt-6">
              <Link
                href="#"
                className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-white"
              >
                {t('report_issue') || 'Report an issue'}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start">
            <h3 className="mb-4 text-lg font-bold text-white">{t('contact_us') || 'Contact Us'}</h3>
            <div className="flex flex-col space-y-4">
              <a
                href="mailto:manager@logisticsservicescchgroupcorp.com"
                className="flex items-center gap-3 text-gray-200 transition-colors hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/30 backdrop-blur-sm">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">manager@logisticsservicescchgroupcorp.com</span>
              </a>

              <a
                href="tel:+50769011954"
                className="flex items-center gap-3 text-gray-200 transition-colors hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/30 backdrop-blur-sm">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">+507 6901-1954</span>
              </a>

              <a
                href="https://www.instagram.com/logisticsservicescch/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-200 transition-colors hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/30 backdrop-blur-sm">
                  <Instagram className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">@logisticsservicescch</span>
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section - Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 flex flex-col items-center border-t border-blue-500/30 pt-6 text-center"
        >
          <p className="text-sm text-gray-200">
            &copy; {new Date().getFullYear()} Logistics Services CCH Group Corp.
            <span className="mx-2">|</span>
            {t('rights_reserved') || 'All rights reserved'}
          </p>
          <p className="mt-2 text-xs text-gray-300">{t('developed_by') || 'Developed by'}</p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
