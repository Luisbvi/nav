'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/language-context';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export default function LanguageSelector({ darkText }: { darkText?: boolean }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English (US)', flag: '/images/flag/usa.svg' },
    { code: 'zh', name: '中文 (CN)', flag: '/images/flag/china.svg' },
    { code: 'es', name: 'Español', flag: '/images/flag/spain.svg' },
    { code: 'fr', name: 'Français', flag: '/images/flag/france.svg' },
  ];

  const selectedLanguage = languages.find((lang) => lang.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const selectLanguage = async (language: LanguageOption) => {
    await setLanguage(language.code);
    setOpen(false);
  };

  // Animation variants
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={handleOpen}
        className="flex cursor-pointer items-center gap-2 rounded-full text-white focus:outline-none dark:text-gray-200"
        aria-expanded={open}
        aria-haspopup="true"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <motion.div
          className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-100 dark:border-gray-700"
          whileHover={{ scale: 1.1 }}
        >
          <Image
            src={selectedLanguage.flag || '/placeholder.svg'}
            alt={`${selectedLanguage.name} flag`}
            fill
            className="object-cover"
          />
        </motion.div>

        <span className={`text-sm font-medium ${darkText && 'not-dark:text-gray-900'}`}>
          {selectedLanguage.name}
        </span>

        <motion.svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white font-medium shadow-lg dark:border-gray-700 dark:bg-gray-800"
            role="menu"
            aria-orientation="vertical"
          >
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
              {languages.map((lang) => (
                <motion.li className="rounded-lg px-2" key={lang.code} variants={itemVariants}>
                  <button
                    onClick={() => selectLanguage(lang)}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white ${
                      selectedLanguage.code === lang.code ? 'bg-gray-50 dark:bg-gray-700' : ''
                    }`}
                    role="menuitem"
                  >
                    <div className="relative h-5 w-5 overflow-hidden rounded-full border border-gray-200 dark:border-gray-600">
                      <Image
                        src={lang.flag || '/placeholder.svg'}
                        alt={`${lang.name} flag`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>{lang.name}</span>
                    {selectedLanguage.code === lang.code && (
                      <Check className="ml-auto h-4 w-4 text-green-500" />
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
}
