import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-400 px-[120px] mt-auto">
      <div className="flex justify-between items-center">
        <Link href="/" className="w-60">
          <div className="relative h-48">
            <Image
              src="/images/logo-w-lg.png"
              alt="logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        <div className="text-center">
          <h3 className="text-[18px] text-white">All rights reserved</h3>
          <p className="text-[14px] text-gray-800">
            Developed by MassivoCreativo
          </p>
        </div>

        <Link
          href="#"
          className="bg-white rounded py-4 px-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer text-center"
        >
          Report an issue
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
