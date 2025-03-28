'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import LanguageSelector from '@/components/layout/language-selector';
import UserComponent from '@/components/user-component';
import { CartButton } from '@/components/cart-button';
import HamburguerButton from '@/components/home/hamburguer-button';
import { useLanguage } from '@/contexts/language-context';

const Header = ({ user }: { user: User | null }) => {
  const { t } = useLanguage();
  // Variants for the main container
  const containerVariants = {
    hidden: {
      opacity: 0,
      x: '100%',
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.86, 0, 0.07, 1],
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  // Variants for individual components
  const componentVariants = {
    hidden: {
      opacity: 0,
      x: 20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex h-24 w-full"
    >
      <motion.nav
        variants={containerVariants}
        className="flex h-14 w-full flex-1 items-center justify-end gap-8 rounded-bl-lg bg-blue-600 pl-10 dark:bg-blue-500"
      >
        {/*Cart*/}
        <motion.div variants={componentVariants}>
          <CartButton />
        </motion.div>

        {/*Selector*/}
        <motion.div variants={componentVariants}>
          <LanguageSelector />
        </motion.div>

        {/*User*/}
        {user ? (
          <motion.div variants={componentVariants}>
            <UserComponent user={user} role={user.user_metadata.role || 'user'} />
          </motion.div>
        ) : (
          <motion.div variants={componentVariants} className="hidden items-center gap-4 md:flex">
            <Link href="/login">
              <button className="cursor-pointer rounded-sm px-4 py-2 text-white transition-all">
                {t('log_in') || 'Log In'}
              </button>
            </Link>
            <div className="h-4 w-0.5 bg-blue-400 dark:bg-blue-400"></div>
            <Link href="/register">
              <button className="cursor-pointer rounded-sm px-4 py-2 text-white transition-all">
                {t('create_account') || 'Create Account'}
              </button>
            </Link>
          </motion.div>
        )}

        {/* Menu  */}
        <motion.div variants={componentVariants}>
          <HamburguerButton user={user} />
        </motion.div>
      </motion.nav>
    </motion.header>
  );
};

export default Header;
