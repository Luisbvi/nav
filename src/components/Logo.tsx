import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';

const Logo = () => {
  return (
    <div className="flex w-full items-center justify-between md:hidden">
      <Link href="/" className="pl-4">
        <Image
          src={'/images/logo-lg.png'}
          alt="logo"
          width={170}
          height={170}
          className="block object-contain dark:hidden"
          priority
        />
        <Image
          src={'/images/logo-w-lg.png'}
          alt="logo"
          width={170}
          height={170}
          className="hidden object-contain dark:block"
          priority
        />
      </Link>
      <div>
        <Navbar></Navbar>
      </div>
    </div>
  );
};

export default Logo;
