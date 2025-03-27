'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center"
          >
            {index > 0 && <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>}
            {item.current ? (
              <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 uppercase transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {item.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
