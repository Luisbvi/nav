'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/contexts/language-context';

const HomeBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full">
      {/* Banner azul */}
      <div className="relative mt-8 w-full overflow-visible rounded-lg bg-blue-600 pt-16 sm:mt-10 sm:pt-20 md:mt-24">
        <div className="flex flex-col items-center justify-between px-4 py-8 sm:px-6 md:px-10 md:py-10 lg:flex-row">
          {/* Texto */}
          <div className="mb-8 w-full text-center lg:mb-0 lg:max-w-[50%] lg:text-left">
            <h2 className="mb-4 text-2xl leading-tight font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">
              {t('title_part1') || 'Your Comprehensive Partner'}
              <br />
              {t('title_part2') || 'in Maritime Supplies'}
            </h2>
            <Link
              href="/catalog"
              className="inline-block rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-blue-600 sm:px-6 sm:py-3 sm:text-base"
            >
              {t('cta_button') || 'Request Your Quote Now'}
            </Link>
          </div>

          {/* Espacio reservado para la imagen en desktop */}
          <div className="hidden md:block md:w-[50%]"></div>
        </div>
      </div>

      {/* Imagen ajustada para que su parte inferior comience en el contenedor azul */}
      <div className="absolute top-0 right-4 z-20 hidden md:right-12 xl:block">
        <div className="relative h-[450px] w-[450px] md:mt-[-44px] lg:mt-[-104px]">
          {/* Shadow radial detrás de la imagen */}
          <div className="absolute inset-0 -z-10 scale-80 rounded-full bg-cyan-600/40 blur-2xl"></div>
          <div className="absolute inset-0 -z-10 scale-70 rounded-full bg-cyan-400/30 blur-xl"></div>
          <div className="absolute inset-0 -z-10 scale-30 rounded-full bg-cyan-100/20 blur-lg"></div>
          <Image
            src="/images/girl.png"
            alt={t('title_part1') + ' ' + t('title_part2') || 'Maritime Supplies Professional'}
            fill
            className="relative z-10 object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
