'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/contexts/language-context';

const HomeBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-blue-600">
      <div className="flex flex-col items-center justify-between px-6 py-8 md:flex-row md:px-10">
        <div className="z-10 mb-6 md:mb-0 md:max-w-[50%]">
          <h2 className="mb-4 text-3xl leading-tight font-bold text-white md:text-4xl lg:text-5xl">
            {t('title_part1') || 'Your Comprehensive Partner'}
            <br />
            {t('title_part2') || 'in Maritime Supplies'}
          </h2>
          <Link
            href="/catalog"
            className="inline-block rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-blue-600"
          >
            {t('cta_button') || 'Request Your Quote Now'}
          </Link>
        </div>
        <div className="relative h-64 w-64 md:h-80 md:w-80">
          <Image
            src="/images/home.png"
            alt={t('title_part1') + ' ' + t('title_part2') || 'Maritime Supplies Professional'}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
