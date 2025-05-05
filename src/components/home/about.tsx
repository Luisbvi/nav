'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

export default function AcercaDeCCH() {
  const { t } = useLanguage();

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="w-full md:w-1/2">
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/about.jpg"
                alt={t('about_image_alt') || 'Maritime workers loading cargo'}
                fill
                className="object-cover object-[center_80%]"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              {t('about_title_part1') || 'About CCH'}
              <br />
              {t('about_title_part2') || 'Logistics Services'}
              <br />
              {t('about_title_part3') || 'Group'}
            </h2>
            <p className="leading-relaxed text-gray-600 dark:text-white">
              {t('about_description') ||
                `At CCH Logistics Services Group, we take pride in being your strategic partner in comprehensive logistics solutions, efficiently serving both in Venezuela and Panama. With a deep understanding of the complexities of maritime and cargo transportation, we are dedicated to optimizing your operations and ensuring the constant flow of your supplies.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
