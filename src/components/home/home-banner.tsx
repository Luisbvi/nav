'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/contexts/language-context';

const HomeBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="relative mx-auto mt-12 w-full max-w-7xl 2xl:mt-24">
      {/* Banner azul */}
      <div className="relative w-full overflow-visible rounded-lg bg-blue-600">
        <div className="flex flex-col items-center justify-between px-4 py-12 sm:px-6 md:px-10 lg:flex-row lg:py-16">
          {/* Texto - ahora con alineación vertical centrada */}
          <div className="flex w-full flex-col items-center justify-center text-center lg:max-w-[50%] lg:items-start lg:text-left">
            <h2 className="mb-6 text-2xl leading-tight font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">
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

      {/* Imagen - ajustada para alineación vertical */}
      <div className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 transform md:right-12 xl:block 2xl:right-28">
        <div className="relative -top-[34px] h-[450] w-[450] 2xl:-top-[63px]">
          {/* Shadow radial detrás de la imagen */}
          <div className="absolute inset-0 -z-10 scale-70 rounded-full bg-cyan-600/40 blur-2xl"></div>
          <div className="absolute inset-0 -z-10 scale-60 rounded-full bg-cyan-400/30 blur-xl"></div>
          <div className="absolute inset-0 -z-10 scale-10 rounded-full bg-cyan-100/20 blur-lg"></div>
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
