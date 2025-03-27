'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

const Banner = () => {
  const { t } = useLanguage();

  return (
    <div className="relative hidden h-60 w-full overflow-hidden rounded-xl text-white shadow-lg md:block md:h-[650px] md:w-64">
      {/* Banner Image */}
      <Image
        src="/images/banner.webp"
        alt={t('banner_alt_text') || 'Supply optimization banner'}
        fill
        className="object-cover object-[45%_55%]"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
        <h3 className="mb-4 text-2xl font-bold text-white drop-shadow-lg md:text-4xl">
          {t('optimize_supply') || 'Optimize your supply'}
        </h3>
      </div>
    </div>
  );
};

export default Banner;
