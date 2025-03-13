import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-blue-400 px-[120px]">
      <div className="flex items-center justify-between">
        <Link href="/" className="w-60">
          <div className="relative h-48">
            <Image src="/images/logo-w-lg.png" alt="logo" fill className="object-contain" />
          </div>
        </Link>

        <div className="text-center">
          <h3 className="text-[18px] text-white">All rights reserved</h3>
          <p className="text-[14px] text-gray-800">Developed by MassivoCreativo</p>
        </div>

        <Link
          href="#"
          className="cursor-pointer rounded bg-white px-6 py-4 text-center shadow-sm transition-shadow hover:shadow-lg"
        >
          Report an issue
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
