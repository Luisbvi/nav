import { motion } from 'framer-motion';
import React from 'react';
import { useLanguage } from '@/contexts/language-context';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const { t } = useLanguage();

  return (
    <div className="mt-10 flex justify-center">
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`rounded-md border px-4 py-2 ${currentPage <= 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('previous') || 'Previous'}
        </motion.button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer rounded-md border px-4 py-2 ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </motion.button>
          );
        })}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`rounded-md border px-4 py-2 dark:bg-gray-800 ${currentPage >= totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t('next') || 'Next'}
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;
